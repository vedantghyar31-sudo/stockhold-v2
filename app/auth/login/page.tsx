'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInGoogle, signInEmail, signUpEmail } from '@/services/auth';
import { Package, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Watermark } from '@/components/ui/Watermark';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try { await signInGoogle(); router.replace('/dashboard'); }
    catch (e: any) { toast.error(e.message || 'Google sign-in failed'); }
    finally { setLoading(false); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) { await signUpEmail(email, password, name); toast.success('Account created!'); }
      else          { await signInEmail(email, password); }
      router.replace('/dashboard');
    } catch (e: any) { toast.error(e.message || 'Authentication failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg mb-3">
            <Package className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Stockhold</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Smart Inventory Management</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all mb-4 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-white dark:bg-slate-800 text-gray-400">or</span></div>
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {isSignUp && <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full py-3 mt-1">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-500 font-semibold hover:text-blue-600">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
      <Watermark />
    </div>
  );
}
