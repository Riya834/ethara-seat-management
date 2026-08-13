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
  ArrowRight,
  Settings,
  Server,
  Check
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

  // Backend API URL Configuration for Cloud / Render Deployment
  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [customBackendUrl, setCustomBackendUrl] = useState(
    () => localStorage.getItem('ethara_backend_url') || ''
  );
  const [configSavedMsg, setConfigSavedMsg] = useState('');

  const handleSaveBackendUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = customBackendUrl.trim();
    if (cleanUrl && !cleanUrl.endsWith('/api') && !cleanUrl.endsWith('/api/')) {
      cleanUrl = cleanUrl.replace(/\/$/, '') + '/api';
    }
    if (cleanUrl) {
      localStorage.setItem('ethara_backend_url', cleanUrl);
      setConfigSavedMsg('Backend API URL saved! Reconnecting...');
    } else {
      localStorage.removeItem('ethara_backend_url');
      setConfigSavedMsg('Reset to default /api route.');
    }
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      const targetPath = res.data.user?.role === 'employee' ? '/directory' : '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Invalid email or password. Please verify credentials or Render Backend URL.'
      );
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
      const targetPath = res.data.user?.role === 'employee' ? '/directory' : '/dashboard';
      navigate(targetPath, { replace: true });
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
      {/* Decorative Doodles & Abstract Shapes */}
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBackendConfig((prev) => !prev)}
            title="Configure Render Backend API URL"
            className="p-2 border border-slate-200/80 rounded-full hover:bg-white text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <Server className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Render Backend URL</span>
          </button>

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setSuccessMsg('');
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
          <button
            onClick={() => fillQuickDemo('admin@ethara.com')}
            className="px-4 py-2 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-full font-bold text-xs shadow-2xs transition-all"
          >
            Quick Admin Demo
          </button>
        </div>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-[36px] border border-white/60 shadow-xl shadow-amber-900/5 p-8 space-y-6">
          
          {/* Render Backend API URL Configuration Drawer */}
          {showBackendConfig && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 text-xs animate-fadeIn">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-[#FBC48B]">
                  <Server className="w-4 h-4" />
                  Render Backend API URL
                </span>
                <button
                  type="button"
                  onClick={() => setShowBackendConfig(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                If your backend is deployed on a separate Render Web Service URL, paste your Render backend link below:
              </p>
              <form onSubmit={handleSaveBackendUrl} className="space-y-2">
                <input
                  type="url"
                  value={customBackendUrl}
                  onChange={(e) => setCustomBackendUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com/api"
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#FBC48B]"
                />
                {configSavedMsg && (
                  <div className="text-[11px] text-emerald-400 font-bold">{configSavedMsg}</div>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#FBC48B] text-slate-900 font-bold rounded-lg text-xs hover:bg-[#f7b674]"
                  >
                    Save & Connect
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Workplace Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {mode === 'signin'
                ? 'Hey, Enter your details to get sign in to your account'
                : 'Join Ethara workplace seating portal in seconds'}
            </p>
          </div>

          {/* Alert Error / Success Messages */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-medium text-center space-y-1 animate-fadeIn">
              <div>{error}</div>
              {error.includes('Render Backend') && (
                <button
                  onClick={() => setShowBackendConfig(true)}
                  className="text-xs font-bold text-rose-900 underline mt-1 block mx-auto"
                >
                  Click here to set Render Backend URL
                </button>
              )}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-medium text-center animate-fadeIn">
              {successMsg}
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ethara.com or hr@ethara.com"
                  required
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-900 font-medium pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="text-right">
                <a
                  href="#help"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Default demo password for all accounts is: Password123!');
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Having trouble in sign in?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-2xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </form>
          ) : (
            /* Sign Up / Register Form */
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

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {mode === 'signin' ? (
                <>
                  Don't have an account? <strong className="text-slate-900">Create Account Now</strong>
                </>
              ) : (
                <>
                  Already have an account? <strong className="text-slate-900">Sign In</strong>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-8 py-4 text-center text-xs text-slate-400 z-10">
        Copyright @Ethara Workplace 2026 | Privacy Policy
      </footer>
    </div>
  );
};
