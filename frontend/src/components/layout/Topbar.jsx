import React, { useState } from 'react';
import { Search, Bell, Bot, UserCheck } from 'lucide-react';
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
      {/* Search Input Bar - Minimal */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employee, seat code, floor, project..."
          className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all shadow-xs"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Minimal AI Spatial Assistant Button */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Bot className="w-3.5 h-3.5 text-white" />
          <span>Spatial AI</span>
        </button>

        {/* Role Badge Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Role: {user?.role || 'Admin'}</span>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full border border-slate-200 shadow-xs overflow-hidden bg-slate-100">
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
