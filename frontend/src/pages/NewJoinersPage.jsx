import React, { useEffect, useState } from 'react';
import { employeeService, seatService } from '../services/api';
import { UserPlus, MapPin, CheckCircle, Search } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import SeatModal from '../components/seats/SeatModal';

const NewJoinersPage = () => {
  const [newJoiners, setNewJoiners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchNewJoiners();
  }, []);

  const fetchNewJoiners = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({ status: 'Unallocated', limit: 100 });
      if (res.success) {
        setNewJoiners(res.data);
      }
    } catch (err) {
      showToast('Failed to load unallocated new joiners.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssignSeat = (emp) => {
    // Open modal with sample available seat F1-ZA001
    setSelectedSeat({ seatCode: 'F1-ZA001', floorNumber: 1, zone: 'Zone A', status: 'Available' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-amber-500" />
          <span>New Joiners & Unallocated Staff ({newJoiners.length})</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Employees onboarded without a seat assignment. Click 'Assign Seat' to allocate spatial location.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Scanning Unallocated Workforce...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newJoiners.map((emp) => (
            <div
              key={emp.id}
              className="clay-card p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={emp.photo}
                  alt={emp.name}
                  className="w-11 h-11 rounded-full bg-amber-100 border border-amber-200 object-cover shrink-0"
                />
                <div className="truncate">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{emp.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 truncate">{emp.designation}</p>
                  <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                    {emp.department}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleQuickAssignSeat(emp)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-sm shrink-0 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Assign</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <SeatModal
        seat={selectedSeat}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchNewJoiners}
      />
    </div>
  );
};

export default NewJoinersPage;
