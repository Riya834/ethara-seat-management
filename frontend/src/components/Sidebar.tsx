import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid,
  Briefcase,
  UserPlus,
  Clock,
  Upload,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'employee';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'hr', 'pm']
    },
    {
      to: '/directory',
      label: 'People Directory',
      icon: Users,
      roles: ['admin', 'hr', 'pm', 'employee']
    },
    {
      to: '/seat-map',
      label: 'Seat Map',
      icon: Grid,
      roles: ['admin', 'hr', 'pm', 'employee']
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: Briefcase,
      roles: ['admin', 'hr', 'pm', 'employee']
    },
    {
      to: '/new-joiners',
      label: 'New Joiners',
      icon: UserPlus,
      roles: ['admin', 'hr', 'pm']
    },
    {
      to: '/requests',
      label: 'Requests Queue',
      icon: Clock,
      roles: ['admin', 'hr', 'pm']
    },
    {
      to: '/bulk-import',
      label: 'Bulk Import',
      icon: Upload,
      roles: ['admin', 'hr']
    }
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="my-4 ml-4 w-20 bg-[#FBC48B] rounded-[32px] flex flex-col justify-between items-center py-6 h-[calc(100vh-32px)] sticky top-4 z-30 shadow-lg shadow-amber-900/5 select-none border border-[#f7b674]">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#FBC48B] flex items-center justify-center font-bold shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-col items-center gap-3 w-full px-2">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-900 hover:bg-white/40'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip on hover */}
              <span className="absolute left-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="flex flex-col items-center gap-3">
        <div
          title={`${user?.name} (${role.toUpperCase()})`}
          className="w-10 h-10 rounded-full bg-slate-900 text-[#FBC48B] font-bold text-sm flex items-center justify-center shadow-xs cursor-pointer"
        >
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="w-10 h-10 rounded-2xl bg-white/30 hover:bg-slate-900 hover:text-white text-slate-900 flex items-center justify-center transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
