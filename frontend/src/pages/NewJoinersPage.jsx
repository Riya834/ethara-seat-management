import React, { useEffect, useState } from 'react';
import { employeeService } from '../services/api';
import { UserPlus, MapPin } from 'lucide-react';
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
      showToast('Failed to load unallocated staff.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssignSeat = (emp) => {
    setSelectedSeat({ seatCode: 'F1-ZA001', floorNumber: 1, zone: 'Zone A', status: 'Available' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-700" />
          <span>New Joiners & Unallocated Staff ({newJoiners.length})</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Employees onboarded without a seat assignment. Click 'Assign' to allocate a seat.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Scanning Unallocated Staff...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {newJoiners.map((emp) => (
            <div
              key={emp.id}
              className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={emp.photo}
                  alt={emp.name}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
                />
                <div className="truncate">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{emp.name}</h4>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{emp.designation}</p>
                  <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                    {emp.department}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleQuickAssignSeat(emp)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shrink-0 flex items-center gap-1 transition-colors"
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
