import React, { useState } from 'react';
import { Search, Bell, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onOpenAI }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-4 z-20 mb-6 flex items-center justify-between gap-4 px-2">
      {/* Search Input Bar - Styled like Eduhouse search bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employee, seat code (e.g. F2-ZA004), floor, project..."
          className="w-full pl-11 pr-4 py-2.5 bg-white/90 backdrop-blur-md rounded-full border border-black/[0.05] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.03)] text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick AI Spatial Assistant Button */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-extrabold text-xs rounded-full shadow-md shadow-amber-400/20 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-slate-900" />
          <span>Spatial AI Chat</span>
        </button>

        {/* Role Badge Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-black/[0.05] text-xs font-bold text-slate-700 shadow-sm">
          <UserCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Role: {user?.role || 'Admin'}</span>
        </div>

        {/* Notifications Button */}
        <button className="relative p-2.5 bg-white/90 backdrop-blur-md rounded-full border border-black/[0.05] shadow-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full border-2 border-amber-400 shadow-md overflow-hidden bg-amber-100">
          <img
            src={user?.employeeDetails?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
