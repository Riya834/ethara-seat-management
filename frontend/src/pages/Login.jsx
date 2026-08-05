import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@ethara.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const quickRoles = [
    { role: 'Admin', email: 'admin@ethara.com', pass: 'admin123' },
    { role: 'HR', email: 'hr@ethara.com', pass: 'hr123' },
    { role: 'Project Manager', email: 'pm@ethara.com', pass: 'pm123' },
    { role: 'Employee', email: 'employee@ethara.com', pass: 'emp123' }
  ];

  return (
    <div className="min-h-screen bg-[#f6f5f0] flex items-center justify-center p-4">
      <div className="clay-card p-8 bg-white/90 backdrop-blur-md rounded-4xl border border-black/[0.04] shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Top Brand Banner */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-amber-400 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/30 mx-auto mb-4 font-black text-2xl">
            <Building2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ethara<span className="text-amber-500">HQ</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Spatial Seat Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ethara.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-md shadow-amber-400/30 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Ethara HQ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role Tester Pills */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Quick Demo Role Switcher
          </p>

          <div className="grid grid-cols-2 gap-2">
            {quickRoles.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setEmail(r.email);
                  setPassword(r.pass);
                }}
                className="p-2 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-slate-800 font-extrabold text-[11px] rounded-xl text-center transition-colors"
              >
                {r.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
