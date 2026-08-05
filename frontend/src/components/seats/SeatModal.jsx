import React, { useState } from 'react';
import { X, MapPin, Briefcase, Calendar, CheckCircle2, LogOut } from 'lucide-react';
import { seatService, employeeService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const SeatModal = ({ seat, isOpen, onClose, onRefresh }) => {
  const { showToast } = useNotification();
  const [assignSearch, setAssignSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !seat) return null;

  const handleSearchEmployees = async (query) => {
    setAssignSearch(query);
    if (query.trim().length >= 2) {
      try {
        const res = await employeeService.getEmployees({ search: query, limit: 5 });
        if (res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error(err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-lg border border-slate-200 relative animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">Seat {seat.seatCode}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Floor {seat.floorNumber} • {seat.zone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Occupant Details */}
        {seat.status === 'Occupied' && seat.employeeName ? (
          <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seat.employeeName}`}
                  alt={seat.employeeName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">{seat.employeeName}</h4>
                <p className="text-[10px] font-semibold text-slate-500">{seat.employeeId}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 font-medium">
              <p className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Project: <strong>{seat.projectName || 'N/A'}</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Allocated: <strong>{seat.allocationDate || 'Recent'}</strong></span>
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-end">
              <button
                disabled={loadingAction}
                onClick={handleReleaseSeat}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Release Seat</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="my-4 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto mb-1" />
            <h4 className="font-bold text-xs text-emerald-900">Seat Available</h4>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Select an employee to allocate this seat.
            </p>
          </div>
        )}

        {/* Assign / Transfer Section */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
            {seat.status === 'Occupied' ? 'Re-assign / Transfer' : 'Assign Employee'}
          </label>

          <input
            type="text"
            value={assignSearch}
            onChange={(e) => handleSearchEmployees(e.target.value)}
            placeholder="Type employee name or EMP ID..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />

          {searchResults.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
              {searchResults.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => handleAssignToSeat(emp.employeeId)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900">{emp.name}</p>
                    <p className="text-[10px] text-slate-500">{emp.employeeId} • {emp.department}</p>
                  </div>
                  <button className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] rounded-md">
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
