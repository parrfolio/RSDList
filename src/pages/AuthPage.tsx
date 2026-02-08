import { useState, useRef, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useAuth } from '@/hooks/useAuth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  updateUserProfile,
  uploadAvatar,
} from '@/lib/auth';
import { readFileAsDataURL, getCroppedBlob } from '@/lib/cropUtils';
import { auth } from '@/lib/firebase';
import { friendlyError } from '@/lib/errorMessages';
import { ArrowLeft, Check, User, Upload, Loader2, X } from 'lucide-react';
import rsdLogo from '@/images/rsd-logo.png';

type Mode = 'splash' | 'login' | 'signup-1' | 'signup-2' | 'signup-3';

/** Inline Google "G" multicolor logo SVG */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ── Signup wizard stepper ──────────────────────────────────────────────
const STEPS = [
  { label: 'Account', subtitle: 'Email & password' },
  { label: 'Profile', subtitle: 'Your details' },
  { label: 'Photo', subtitle: 'Profile picture' },
] as const;

function SignupStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-start justify-center mb-8" aria-label="Signup progress">
      {STEPS.map((step, i) => {
        const stepNum = (i + 1) as 1 | 2 | 3;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <Fragment key={stepNum}>
            {/* Connector line between circles */}
            {i > 0 && (
              <div
                className={`h-0.5 w-10 sm:w-14 mt-4 flex-shrink-0 transition-colors ${
                  isCompleted ? 'bg-[#E8A530]' : 'bg-white/20'
                }`}
              />
            )}

            <div className="flex flex-col items-center min-w-[72px]">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted || isCurrent ? 'bg-[#E8A530] text-white' : 'bg-[#333] text-white/50'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>

              {/* Label */}
              <span
                className={`text-xs mt-1.5 font-semibold ${
                  isCurrent ? 'text-white' : 'text-white/50'
                }`}
              >
                {step.label}
              </span>

              {/* Subtitle */}
              <span
                className={`text-[10px] leading-tight ${
                  isCurrent ? 'text-white/70' : 'text-white/30'
                }`}
              >
                {step.subtitle}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

// ── Shared input class ─────────────────────────────────────────────────
const inputClassName =
  'w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E8A530] focus:border-transparent transition-colors';

// ── AuthPage ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard step 2 state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Wizard step 3 state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const croppedBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  // Redirect if authenticated AND not in the signup wizard
  if (isAuthenticated && !mode.startsWith('signup-')) {
    navigate('/rsd', { replace: true });
    return null;
  }

  function resetForm() {
    setEmail('');
    setPassword('');
    setError(null);
  }

  function resetWizard() {
    setFirstName('');
    setLastName('');
    setCropSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setPhotoPreview(null);
    croppedBlobRef.current = null;
  }

  function goToSplash() {
    resetForm();
    resetWizard();
    setMode('splash');
  }

  // ── Login handlers ──
  async function handleEmailSignIn() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      navigate('/rsd');
    } catch (err: unknown) {
      setError(friendlyError(err, 'Sign in failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/rsd');
    } catch (err: unknown) {
      setError(friendlyError(err, 'Google sign in failed'));
    } finally {
      setLoading(false);
    }
  }

  // ── Wizard step handlers ──
  async function handleStep1Continue() {
    if (!email || password.length < 6) return;

    // If already authenticated (e.g. navigated back from step 2), skip signup
    if (isAuthenticated) {
      setError(null);
      setMode('signup-2');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      setMode('signup-2');
    } catch (err: unknown) {
      setError(friendlyError(err, 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2Continue() {
    const uid = auth.currentUser?.uid;
    if (!uid || !firstName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
      await updateUserProfile(uid, { displayName: fullName });
      setMode('signup-3');
    } catch (err: unknown) {
      setError(friendlyError(err, 'Profile update failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }
    setError(null);
    const dataUrl = await readFileAsDataURL(file);
    setCropSrc(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleCancelCrop() {
    setCropSrc(null);
    setCroppedArea(null);
  }

  async function handleSaveCrop() {
    if (!cropSrc || !croppedArea) return;
    const blob = await getCroppedBlob(cropSrc, croppedArea);
    croppedBlobRef.current = blob;
    setPhotoPreview(URL.createObjectURL(blob));
    setCropSrc(null);
    setCroppedArea(null);
  }

  async function handleComplete() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (croppedBlobRef.current) {
      setLoading(true);
      setError(null);
      try {
        const file = new File([croppedBlobRef.current], 'avatar.jpg', { type: 'image/jpeg' });
        await uploadAvatar(uid, file);
      } catch (err: unknown) {
        setError(friendlyError(err, 'Photo upload failed'));
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    navigate('/rsd');
  }

  function handleSkip() {
    navigate('/rsd');
  }

  // ── Render: Login mode ──
  if (mode === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-background text-white">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 px-6 py-8">
          <button
            type="button"
            onClick={goToSplash}
            className="self-start mb-8 p-1 -ml-1 text-white/70 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center"
            aria-label="Back to main screen"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-2xl font-bold mb-8">Sign in to RSD Wants</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-white/70 mb-1.5"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-white/70 mb-1.5"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className={inputClassName}
              />
            </div>

            <button
              type="button"
              onClick={handleEmailSignIn}
              disabled={loading || !email || !password}
              className="w-full h-14 rounded-full bg-[#E8A530] text-white text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4952a] active:scale-[0.98] transition-all mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Signup wizard ──
  if (mode.startsWith('signup-')) {
    const stepNum = Number(mode.split('-')[1]) as 1 | 2 | 3;

    return (
      <div className="min-h-screen flex flex-col bg-background text-white">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 px-6 py-8">
          {/* Stepper */}
          <SignupStepper currentStep={stepNum} />

          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ── Step 1: Account ── */}
          {stepNum === 1 && (
            <div className="flex flex-col flex-1">
              <h1 className="text-2xl font-bold mb-2">Create your account</h1>
              <p className="text-white/50 text-sm mb-6">Enter your email and create a password.</p>

              <div className="space-y-4 flex-1">
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-white/70 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-sm font-medium text-white/70 mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 chars)"
                    autoComplete="new-password"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center justify-between pt-8 pb-4">
                <button
                  type="button"
                  onClick={goToSplash}
                  className="text-white/70 font-bold text-base hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep1Continue}
                  disabled={loading || !email || password.length < 6}
                  className="h-14 px-10 rounded-full bg-[#1e1e1e] border border-white/10 text-white text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2a2a] active:scale-[0.98] transition-all"
                >
                  {loading ? 'Creating…' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Profile ── */}
          {stepNum === 2 && (
            <div className="flex flex-col flex-1">
              <h1 className="text-2xl font-bold mb-2">Tell us about yourself</h1>
              <p className="text-white/50 text-sm mb-6">
                Add your name so others can recognize you.
              </p>

              <div className="space-y-4 flex-1">
                <div>
                  <label
                    htmlFor="signup-firstname"
                    className="block text-sm font-medium text-white/70 mb-1.5"
                  >
                    First name
                  </label>
                  <input
                    id="signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-lastname"
                    className="block text-sm font-medium text-white/70 mb-1.5"
                  >
                    Last name (optional)
                  </label>
                  <input
                    id="signup-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center justify-between pt-8 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signup-1');
                  }}
                  className="text-white/70 font-bold text-base hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Continue}
                  disabled={loading || !firstName.trim()}
                  className="h-14 px-10 rounded-full bg-[#1e1e1e] border border-white/10 text-white text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2a2a] active:scale-[0.98] transition-all"
                >
                  {loading ? 'Saving…' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Photo ── */}
          {stepNum === 3 && (
            <div className="flex flex-col flex-1">
              <h1 className="text-2xl font-bold mb-2">Add a profile photo</h1>
              <p className="text-white/50 text-sm mb-8">Help others recognize you (optional)</p>

              {/* Upload area */}
              <div className="flex flex-col items-center gap-5 flex-1">
                {/* Circular preview / placeholder */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-40 h-40 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden hover:border-[#E8A530] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8A530] focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="Select profile photo"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-16 w-16 text-white/30" />
                  )}
                </button>

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 h-12 px-6 rounded-full border border-white/40 text-white font-semibold hover:bg-white/5 active:scale-[0.98] transition-all min-h-[44px]"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </button>

                <p className="text-xs text-white/40 text-center max-w-[260px]">
                  Upload a profile photo (optional)
                  <br />
                  JPG, PNG or GIF. Max 5 MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleFileSelected}
                />
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center justify-between pt-8 pb-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signup-2');
                  }}
                  className="text-white/70 font-bold text-base hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={loading}
                    className="h-14 px-8 rounded-full border border-white/40 text-white font-bold hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-40"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading || !photoPreview}
                    className="h-14 px-8 rounded-full bg-[#1e1e1e] border border-white/10 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2a2a] active:scale-[0.98] transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading…
                      </span>
                    ) : (
                      'Complete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Crop overlay (step 3) ── */}
        {cropSrc && (
          <div className="fixed inset-0 z-[100] bg-background flex flex-col">
            {/* Crop toolbar */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border flex-shrink-0">
              <button
                type="button"
                onClick={handleCancelCrop}
                className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors min-h-[44px] min-w-[44px]"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <span className="font-semibold text-sm">Crop Photo</span>
              <button
                type="button"
                onClick={handleSaveCrop}
                className="flex items-center gap-1 text-sm font-semibold text-[#E8A530] hover:text-[#d4952a] transition-colors min-h-[44px] min-w-[44px]"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>

            {/* Crop area */}
            <div className="relative flex-1">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-4 px-8 py-6 border-t border-border flex-shrink-0">
              <span className="text-xs text-muted-foreground">−</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 accent-primary"
                aria-label="Zoom"
              />
              <span className="text-xs text-muted-foreground">+</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render: Splash screen (default) ──
  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 px-6">
        {/* Logo area — takes up top ~55% */}
        <div className="flex-[3] flex items-center justify-center pt-8">
          <img
            src={rsdLogo}
            alt="Record Store Day"
            className="w-full max-w-[320px] h-auto object-contain"
          />
        </div>

        {/* Tagline */}
        <h1 className="text-[28px] leading-tight font-bold text-center">
          Your Record
          <br />
          Store Day List!
        </h1>

        {/* Buttons area */}
        <div className="flex flex-col gap-3 mt-8">
          {/* Sign up free */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              resetWizard();
              setMode('signup-1');
            }}
            disabled={loading}
            className="w-full h-14 rounded-full bg-[#E8A530] text-white text-lg font-bold hover:bg-[#d4952a] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Sign up free
          </button>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 rounded-full border border-white/40 bg-transparent text-white text-lg font-bold flex items-center justify-center gap-2.5 hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Error display on splash */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Bottom spacer + Log in link */}
        <div className="flex-[2] flex items-end justify-center pb-12">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setMode('login');
            }}
            className="text-white font-bold text-base hover:underline min-h-[44px]"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
