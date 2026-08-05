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
  Building2
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
    { label: 'AI Assistant', path: '/ai-chat', icon: Bot, badge: 'AI' },
  ];

  return (
    <aside className="w-64 h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between z-30 shrink-0">
      <div>
        {/* Brand Logo - Minimal Slate */}
        <div className="flex items-center gap-3 px-2 py-1 mb-8">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
              Ethara<span className="text-slate-500">HQ</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Spatial Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.employeeDetails?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 object-cover shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
              <span className="inline-block text-[10px] font-semibold text-slate-500">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
