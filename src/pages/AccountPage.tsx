import { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useAuth } from '@/hooks/useAuth';
import { useWants } from '@/hooks/useWants';
import { useUIStore } from '@/stores/uiStore';
import { signOut, updateUserProfile, uploadAvatar } from '@/lib/auth';
import { readFileAsDataURL, getCroppedBlob } from '@/lib/cropUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { User, Camera, Pencil, LogOut, Check, Loader2, X } from 'lucide-react';
import { BuyMeCoffee } from '@/components/app/BuyMeCoffee';
import { friendlyError } from '@/lib/errorMessages';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const activeEventId = useUIStore((s) => s.activeEventId);
  const { data: wants } = useWants(activeEventId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const photoURL = user?.photoURL ?? firebaseUser?.photoURL ?? null;
  const displayName = user?.displayName ?? firebaseUser?.displayName ?? 'Anonymous';
  const email = user?.email ?? firebaseUser?.email ?? '—';

  const { wantedCount, foundCount } = useMemo(() => {
    const items = wants ?? [];
    return {
      wantedCount: items.filter((w) => w.status === 'WANTED').length,
      foundCount: items.filter((w) => w.status === 'ACQUIRED').length,
    };
  }, [wants]);

  function handleEditName() {
    setNewDisplayName(displayName);
    setIsEditingName(true);
  }

  async function handleSaveName() {
    if (!firebaseUser) return;
    const trimmed = newDisplayName.trim();
    if (trimmed && trimmed !== displayName) {
      await updateUserProfile(firebaseUser.uid, { displayName: trimmed });
    }
    setIsEditingName(false);
  }

  function handleChangePhoto() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setCropSrc(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleCancelCrop() {
    setCropSrc(null);
    setCroppedArea(null);
  }

  async function handleSaveCrop() {
    if (!cropSrc || !croppedArea || !firebaseUser) return;
    setIsUploading(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedArea);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      await uploadAvatar(firebaseUser.uid, file);
      setImgError(false);
    } catch (err) {
      toast.error(friendlyError(err, 'Avatar upload failed. Please try again.'));
    } finally {
      setIsUploading(false);
      setCropSrc(null);
      setCroppedArea(null);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/auth');
    } catch {
      // sign-out failed silently
    }
  }

  return (
    <div className="px-4 pt-4 pb-4 space-y-6">
      <h2 className="text-2xl font-bold">Account</h2>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8">
          {/* Avatar */}
          <div className="relative">
            {photoURL && !imgError ? (
              <img
                src={photoURL}
                alt={displayName}
                className="h-28 w-28 rounded-full object-cover border-4 border-border"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-border bg-muted">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <button
              type="button"
              onClick={handleChangePhoto}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label="Change photo"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>

          {/* Name + Email */}
          <div className="flex flex-col items-center gap-1 w-full max-w-xs">
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="text-center"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName} aria-label="Save name">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{displayName}</span>
                <button
                  type="button"
                  onClick={handleEditName}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit display name"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>

          <Separator className="w-full" />

          {/* Stats row */}
          <div className="grid w-full max-w-xs grid-cols-2 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">{wantedCount}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Wanted</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-border">
              <span className="text-2xl font-bold">{foundCount}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="secondary" onClick={handleSignOut} className="w-full">
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>

      <BuyMeCoffee />

      <p className="text-[11px] text-muted-foreground/60 text-center leading-snug px-4">
        This app is not affiliated with, endorsed by, or associated with Record Store Day or recordstoreday.com.
      </p>

      {/* Fullscreen crop overlay */}
      {cropSrc && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
          {/* Crop toolbar */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-border flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={handleCancelCrop} disabled={isUploading}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <span className="font-semibold text-sm">Crop Photo</span>
            <Button size="sm" onClick={handleSaveCrop} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
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
            />
            <span className="text-xs text-muted-foreground">+</span>
          </div>
        </div>
      )}
    </div>
  );
}
