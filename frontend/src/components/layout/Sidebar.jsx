import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Briefcase, 
  Layers, 
  UserPlus, 
  FileText, 
  Bot, 
  LogOut,
  Building2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Visual Seat Map', path: '/seat-map', icon: Map },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Projects', path: '/projects', icon: Briefcase },
    { label: 'Floors & Zones', path: '/floors-zones', icon: Layers },
    { label: 'New Joiners', path: '/new-joiners', icon: UserPlus },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'AI Assistant', path: '/ai-chat', icon: Bot, badge: 'AI 2.0' },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] border border-black/[0.04] flex flex-col justify-between z-30 shrink-0">
      <div>
        {/* Brand Logo matching Eduhouse styling */}
        <div className="flex items-center gap-3 px-3 py-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-900 shadow-md shadow-amber-400/30 font-extrabold text-xl">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              Ethara<span className="text-amber-500">HQ</span>
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">Spatial Management</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/25 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.employeeDetails?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt="User Avatar"
              className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 object-cover shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
              <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full mt-0.5">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
