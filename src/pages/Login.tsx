import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import Logo from '../assets/SAMKIEL_LOGO.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  React.useEffect(() => {
    if (!isLoading && user && user.role === 'admin') {
      navigate(redirectPath, { replace: true });
    }
  }, [user, isLoading, navigate, redirectPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {

      setError(err.message || 'Invalid credentials or access denied');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      {/* Wordmark at top */}
      <div className="flex flex-col items-center mb-12">
        <img src={Logo} alt="SAMKIEL" className="w-12 h-12 object-contain mb-4" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold tracking-tight text-white font-heading">SAMKIEL</span>
          <span className="text-accent text-xs font-bold uppercase tracking-[0.3em] mt-1">Lighthouse</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 font-heading">Admin Access</h1>
          <p className="text-secondary text-sm font-body">
            Sign in to your SAMKIEL admin account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@samkiel.tech"
                className="w-full bg-base border border-border-color rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-colors font-body"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-base border border-border-color rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-colors font-body"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0A] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 font-body"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-secondary/40 text-[10px] uppercase tracking-[0.2em] font-body">
        &copy; {new Date().getFullYear()} SAMKIEL TECHNOLOGY GROUP
      </p>
    </div>
  );
}
