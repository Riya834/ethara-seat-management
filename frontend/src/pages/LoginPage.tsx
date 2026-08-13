import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Globe,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up / Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'hr' | 'pm' | 'employee'>('employee');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Senior Specialist');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'employee' ? '/directory' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email: regEmail,
        password: regPassword,
        role,
        department,
        designation
      });

      setSuccessMsg('Account created successfully!');
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'employee' ? '/directory' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (emailVal: string) => {
    setEmail(emailVal);
    setPassword('Password123!');
    setMode('signin');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans flex flex-col justify-between relative overflow-hidden select-none">
      {/* Decorative Doodles & Abstract Shapes (inspired by reference UI) */}
      <div className="absolute top-16 left-12 opacity-20 pointer-events-none hidden md:block">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path d="M10,50 Q30,10 50,50 T90,50" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="absolute bottom-10 left-16 w-16 h-36 bg-[#FBC48B] rounded-t-xl border-2 border-slate-900 pointer-events-none hidden md:block overflow-hidden">
        <div className="grid grid-cols-2 gap-2 p-2 opacity-30">
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
        </div>
      </div>
      <div className="absolute bottom-10 right-16 w-20 h-40 bg-[#FBC48B] rounded-t-xl border-2 border-slate-900 pointer-events-none hidden md:block">
        <div className="grid grid-cols-2 gap-2 p-3 opacity-30">
          <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
          <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
          <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
          <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
        </div>
      </div>

      {/* Top Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold">
            <Building2 className="w-5 h-5 text-[#FBC48B]" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Ethara</span>
            <span className="text-[10px] block font-medium text-slate-500 leading-none">
              Workplace Seating Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
            <Globe className="w-5 h-5" />
          </button>
          {mode === 'signin' ? (
            <button
              onClick={() => setMode('signup')}
              className="text-xs font-bold text-slate-800 hover:underline px-3 py-1.5"
            >
              Sign up
            </button>
          ) : (
            <button
              onClick={() => setMode('signin')}
              className="text-xs font-bold text-slate-800 hover:underline px-3 py-1.5"
            >
              Sign in
            </button>
          )}

          <button
            onClick={() => fillQuickDemo('admin@ethara.com')}
            className="px-4 py-2 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-full text-xs font-bold shadow-sm transition-all"
          >
            Quick Admin Demo
          </button>
        </div>
      </header>

      {/* Central Login / Register Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div className="bg-white w-full max-w-md rounded-[32px] shadow-xl shadow-amber-900/5 border border-slate-100 p-8 space-y-6">
          {/* Header text */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Workplace Sign In' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {mode === 'signin'
                ? 'Hey, Enter your details to get sign in to your account'
                : 'Enter your credentials to register a new Ethara account'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-2xl text-center">
              {successMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email / Phone No"
                  required
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passcode"
                  required
                  className="w-full pl-4 pr-12 py-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => alert('Password reset link has been dispatched to your email.')}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                >
                  Having trouble in sign in?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-2xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign in'}
              </button>
            </form>
          ) : (
            /* SIGN UP / REGISTER FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name (e.g. Priya Sharma)"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Work Email (priya@ethara.com)"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="employee">Employee</option>
                    <option value="pm">Project Manager</option>
                    <option value="hr">HR Lead</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">HR</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create Passcode"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-2xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Social Sign In / Quick Demo Role Selector */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-100 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                — Or Sign in with Demo Role —
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@ethara.com')}
                className="p-2.5 border border-slate-200/80 hover:bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('hr@ethara.com')}
                className="p-2.5 border border-slate-200/80 hover:bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>HR Lead</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('pm.atlas@ethara.com')}
                className="p-2.5 border border-slate-200/80 hover:bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Project Mgr</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('emp.john@ethara.com')}
                className="p-2.5 border border-slate-200/80 hover:bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Employee</span>
              </button>
            </div>
          </div>

          {/* Toggle mode footer text */}
          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-slate-900 hover:underline"
                >
                  Create Account Now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-bold text-slate-900 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-[11px] font-medium text-slate-500 z-10">
        Copyright @Ethara Workplace 2026 | Privacy Policy
      </footer>
    </div>
  );
};
