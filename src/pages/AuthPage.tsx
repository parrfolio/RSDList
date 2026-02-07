import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import rsdLogo from '@/images/rsd-logo.png';

type Mode = 'splash' | 'login' | 'signup';

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

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/rsd', { replace: true });
    return null;
  }

  function resetForm() {
    setEmail('');
    setPassword('');
    setError(null);
  }

  function goToSplash() {
    resetForm();
    setMode('splash');
  }

  async function handleEmailSignIn() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      navigate('/rsd');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      navigate('/rsd');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
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
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Login / Signup form (shared layout) ──
  if (mode === 'login' || mode === 'signup') {
    const isSignup = mode === 'signup';
    return (
      <div className="min-h-screen flex flex-col bg-background text-white">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 px-6 py-8">
          {/* Back button */}
          <button
            type="button"
            onClick={goToSplash}
            className="self-start mb-8 p-1 -ml-1 text-white/70 hover:text-white transition-colors"
            aria-label="Back to main screen"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Heading */}
          <h1 className="text-2xl font-bold mb-8">
            {isSignup ? 'Create your account' : 'Sign in to RSD Wants'}
          </h1>

          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-white/70 mb-1.5"
              >
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E8A530] focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-white/70 mb-1.5"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'Create a password (min 6 chars)' : 'Your password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E8A530] focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={isSignup ? handleEmailSignUp : handleEmailSignIn}
              disabled={loading || !email || (isSignup ? password.length < 6 : !password)}
              className="w-full h-14 rounded-full bg-[#E8A530] text-white text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#d4952a] active:scale-[0.98] transition-all mt-2"
            >
              {loading
                ? isSignup
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignup
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Splash screen (default) ──
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
              setMode('signup');
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
            className="text-white font-bold text-base hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
