import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user.role !== 'admin') {
        toast.error('Access denied: Admin privileges required');
        return;
      }
      setAuth(data.token, data.user);
      toast.success('Welcome back to TripWise Admin');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-surface-bg flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Identity Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <h1 className="text-title-dashboard tracking-tight text-slate-900 mt-4">TripWise Admin</h1>
          <p className="text-body-main">Sign in to access your enterprise control panel.</p>
        </div>

        {/* Login Form Container */}
        <div className="enterprise-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@tripwise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="enterprise-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); toast('Contact system administrator for password resets.'); }} className="text-[12px] font-semibold text-brand-600 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="enterprise-input pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full h-11 text-[15px]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[12px] text-slate-400 font-medium">
          Protected by enterprise-grade SSL encryption • TripWise Inc.
        </p>
      </div>
    </div>
  );
}
