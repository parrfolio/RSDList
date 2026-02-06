import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Disc3 } from 'lucide-react';

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/rsd', { replace: true });
    return null;
  }

  async function handleEmailSignIn() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back!');
      navigate('/rsd');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignUp() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      toast.success('Account created!');
      navigate('/rsd');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome!');
      navigate('/rsd');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookSignIn() {
    setLoading(true);
    try {
      await signInWithFacebook();
      toast.success('Welcome!');
      navigate('/rsd');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Facebook sign in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Disc3 className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold text-primary">RSD Wants</h1>
          <p className="text-muted-foreground text-center">
            Track your Record Store Day wants list
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social sign-in buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
              >
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="w-full"
              >
                Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="space-y-3 pt-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleEmailSignIn}
                  disabled={loading || !email || !password}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-3 pt-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleEmailSignUp}
                  disabled={loading || !email || password.length < 6}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
