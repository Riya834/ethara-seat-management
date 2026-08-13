import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, User, Briefcase, Mail, Phone, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Employee } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/employees/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee by name, ID (ETH-001), email, or seat (F1-ZA-001)..."
            autoFocus
            className="flex-1 text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none bg-transparent"
          />
          {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Type an employee name, employee ID, project code, or seat number to lookup.
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching employees or seats found for "{query}".
            </div>
          ) : (
            results.map((emp) => (
              <div
                key={emp._id}
                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{emp.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
                        {emp.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {emp.designation} • <span className="font-medium text-slate-700">{emp.department}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {emp.email}
                      </span>
                      {emp.projectId && (
                        <span className="flex items-center gap-1 font-medium text-indigo-600">
                          <Briefcase className="w-3.5 h-3.5" />
                          {emp.projectId.code || emp.projectId.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seat Location Pill */}
                <div className="shrink-0 sm:text-right">
                  {emp.seatId ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-xs border border-emerald-200">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        Seat {emp.seatId.seatNumber} (Fl {emp.seatId.floorId?.floorNumber}, {emp.seatId.zoneId?.zoneName})
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl font-semibold text-xs border border-amber-200">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Seat Allocation Pending</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
