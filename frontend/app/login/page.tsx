'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email');
        return;
      }

      await login(email, password);

      // Redirect to dashboard
      if (window.location.hash.includes('teacher')) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error('[v0] Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg hud-border">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">EduSync</h1>
          <p className="text-muted-foreground mt-2">Learn anytime, anywhere</p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-card hud-border rounded-lg p-4 mb-6">
          <p className="text-sm font-bold text-primary mb-2">Demo Credentials:</p>
          <div className="text-sm text-foreground space-y-1">
            <p><strong className="text-primary-foreground/90">Student:</strong> student@example.com / password123</p>
            <p><strong className="text-primary-foreground/90">Teacher:</strong> teacher@example.com / password123</p>
            <p><strong className="text-primary-foreground/90">Admin:</strong> admin@example.com / password123</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-card hud-border rounded-lg p-6">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={isLoading}
                className="w-full bg-input"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                  className="w-full pr-10 bg-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={() => setRememberMe(!rememberMe)}
              />
              <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Remember me
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-primary font-bold hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-card hud-border py-4 rounded-lg">
            <p className="text-2xl font-bold text-foreground">📚</p>
            <p className="text-xs text-muted-foreground mt-1 tracking-widest">100+ COURSES</p>
          </div>
          <div className="bg-card hud-border py-4 rounded-lg">
            <p className="text-2xl font-bold text-foreground">📱</p>
            <p className="text-xs text-muted-foreground mt-1 tracking-widest">OFFLINE</p>
          </div>
          <div className="bg-card hud-border py-4 rounded-lg">
            <p className="text-2xl font-bold text-foreground">⚡</p>
            <p className="text-xs text-muted-foreground mt-1 tracking-widest">SYNC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
