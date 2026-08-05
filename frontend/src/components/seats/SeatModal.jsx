import React, { useState } from 'react';
import { X, MapPin, User, Briefcase, Calendar, CheckCircle2, UserPlus, RefreshCw, LogOut } from 'lucide-react';
import { seatService, employeeService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const SeatModal = ({ seat, isOpen, onClose, onRefresh }) => {
  const { showToast } = useNotification();
  const [assignSearch, setAssignSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !seat) return null;

  const handleSearchEmployees = async (query) => {
    setAssignSearch(query);
    if (query.trim().length >= 2) {
      setIsSearching(true);
      try {
        const res = await employeeService.getEmployees({ search: query, limit: 5 });
        if (res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAssignToSeat = async (employeeId) => {
    setLoadingAction(true);
    try {
      const res = await seatService.assignSeat({ employeeId, seatCode: seat.seatCode });
      if (res.success) {
        showToast(`Assigned seat ${seat.seatCode} successfully!`, 'success');
        onRefresh();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Seat assignment failed', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReleaseSeat = async () => {
    setLoadingAction(true);
    try {
      const res = await seatService.releaseSeat({ seatCode: seat.seatCode });
      if (res.success) {
        showToast(`Seat ${seat.seatCode} released!`, 'success');
        onRefresh();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Release failed', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-extrabold shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Seat {seat.seatCode}</h3>
              <p className="text-xs text-slate-500 font-semibold">Floor {seat.floorNumber} • {seat.zone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Occupant Details */}
        {seat.status === 'Occupied' && seat.employeeName ? (
          <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 overflow-hidden shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seat.employeeName}`}
                  alt={seat.employeeName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{seat.employeeName}</h4>
                <p className="text-xs font-semibold text-slate-500">{seat.employeeId}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <p className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Project: <strong>{seat.projectName || 'N/A'}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Allocated on: <strong>{seat.allocationDate || 'Recent'}</strong></span>
              </p>
            </div>

            {/* Release Button */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
              <button
                disabled={loadingAction}
                onClick={handleReleaseSeat}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Release Seat</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="my-5 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-extrabold text-sm text-emerald-900">Seat is Currently Available</h4>
            <p className="text-xs text-emerald-700 mt-1 font-medium">
              Assign an employee to this vacant seat using the search below.
            </p>
          </div>
        )}

        {/* Assign / Transfer Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            {seat.status === 'Occupied' ? 'Re-assign / Transfer Seat' : 'Assign Employee to Seat'}
          </label>

          <input
            type="text"
            value={assignSearch}
            onChange={(e) => handleSearchEmployees(e.target.value)}
            placeholder="Type employee name or EMP ID..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {searchResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg">
              {searchResults.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => handleAssignToSeat(emp.employeeId)}
                  className="p-2 hover:bg-amber-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <p className="font-extrabold text-slate-900">{emp.name}</p>
                    <p className="text-[10px] text-slate-500">{emp.employeeId} • {emp.department}</p>
                  </div>
                  <button className="px-3 py-1 bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg">
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatModal;
