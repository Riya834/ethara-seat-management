import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bot, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onToggleAIChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onToggleAIChat }) => {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const tabs = [
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'hr', 'pm'] },
    { to: '/directory', label: 'People', roles: ['admin', 'hr', 'pm', 'employee'] },
    { to: '/seat-map', label: 'Seat Map', roles: ['admin', 'hr', 'pm', 'employee'] },
    { to: '/projects', label: 'Projects', roles: ['admin', 'hr', 'pm', 'employee'] },
    { to: '/new-joiners', label: 'New Joiners', roles: ['admin', 'hr', 'pm'] },
    { to: '/requests', label: 'Requests', roles: ['admin', 'hr', 'pm'] },
    { to: '/bulk-import', label: 'Import', roles: ['admin', 'hr'] }
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(role));

  return (
    <header className="h-16 px-8 flex items-center justify-between sticky top-0 z-20 bg-[#FAF7F2]/80 backdrop-blur-md border-b border-[#EFE8DC]">
      {/* Horizontal Navigation Pills */}
      <nav className="flex items-center gap-1.5 bg-white p-1.5 rounded-full border border-[#EFE8DC] shadow-2xs">
        {visibleTabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF7F2]'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-[#EFE8DC] rounded-full text-slate-500 text-xs font-medium transition-all shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search...</span>
        </button>

        <button
          onClick={onToggleAIChat}
          className="flex items-center gap-2 px-4 py-2 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-full font-bold text-xs shadow-xs transition-all transform active:scale-95"
        >
          <Bot className="w-4 h-4 text-slate-900" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <div className="px-3 py-1.5 bg-white rounded-full border border-[#EFE8DC] text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>{user?.role}</span>
        </div>
      </div>
    </header>
  );
};
