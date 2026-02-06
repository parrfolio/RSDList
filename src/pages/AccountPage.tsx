import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const AVATARS = [
  { id: 'vinyl-1', label: '🎵 Vinyl 1' },
  { id: 'vinyl-2', label: '🎶 Vinyl 2' },
  { id: 'vinyl-3', label: '🎸 Vinyl 3' },
  { id: 'turntable-1', label: '📀 Turntable' },
  { id: 'headphones-1', label: '🎧 Headphones' },
  { id: 'speaker-1', label: '🔊 Speaker' },
];

export default function AccountPage() {
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/auth');
    } catch {
      toast.error('Failed to sign out');
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Account</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Display Name</span>
              <span className="font-medium">
                {user?.displayName ?? firebaseUser?.displayName ?? 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium">
                {user?.email ?? firebaseUser?.email ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avatar</span>
              <span className="text-lg">
                {AVATARS.find((a) => a.id === (user?.avatarId ?? 'vinyl-1'))?.label ?? '🎵'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Providers</span>
              <div className="flex gap-1">
                {(user?.authProviders ?? []).map((p) => (
                  <Badge key={p} variant="secondary">
                    {p.replace('.com', '')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar selector placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Avatar</CardTitle>
          <CardDescription>Select a preset avatar for your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={`p-4 rounded-lg border-2 text-2xl text-center transition-colors ${
                  (user?.avatarId ?? 'vinyl-1') === avatar.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {avatar.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        onClick={handleSignOut}
        className="w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
