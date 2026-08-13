import React, { useState, useEffect } from 'react';
import {
  Grid,
  Layers,
  MapPin,
  User,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wrench,
  X,
  Send,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { Floor, Zone, Seat, Employee, Project } from '../types';
import { useAuth } from '../context/AuthContext';

export const SeatMapPage: React.FC = () => {
  const { user } = useAuth();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unallocatedEmployees, setUnallocatedEmployees] = useState<Employee[]>([]);

  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Direct Assign / Request states
  const [assignEmployeeId, setAssignEmployeeId] = useState<string>('');
  const [requestReason, setRequestReason] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedFloorId) {
      fetchZonesForFloor(selectedFloorId);
    }
  }, [selectedFloorId]);

  useEffect(() => {
    fetchSeats();
  }, [selectedFloorId, selectedZoneId, statusFilter, projectFilter]);

  const fetchInitialData = async () => {
    try {
      const [flRes, projRes, empRes] = await Promise.all([
        api.get('/seats/floors'),
        api.get('/projects'),
        api.get('/employees?seatAllocationStatus=pending&limit=100')
      ]);

      setFloors(flRes.data);
      setProjects(projRes.data);
      setUnallocatedEmployees(empRes.data.data);

      if (flRes.data.length > 0) {
        setSelectedFloorId(flRes.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load initial floor data:', err);
    }
  };

  const fetchZonesForFloor = async (floorId: string) => {
    try {
      const res = await api.get(`/seats/floors/${floorId}/zones`);
      setZones(res.data);
      setSelectedZoneId(''); // Reset zone filter
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const fetchSeats = async () => {
    if (!selectedFloorId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ floorId: selectedFloorId });
      if (selectedZoneId) params.append('zoneId', selectedZoneId);
      if (statusFilter) params.append('status', statusFilter);
      if (projectFilter) params.append('projectId', projectFilter);

      const res = await api.get(`/seats?${params.toString()}`);
      setSeats(res.data);
    } catch (err) {
      console.error('Failed to fetch seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAssign = async () => {
    if (!selectedSeat || !assignEmployeeId) return;
    setActionSubmitting(true);
    setActionSuccessMsg('');
    try {
      await api.post('/seats/assign', {
        seatId: selectedSeat._id,
        employeeId: assignEmployeeId
      });
      setActionSuccessMsg(`Seat ${selectedSeat.seatNumber} successfully allocated!`);
      setSelectedSeat(null);
      fetchSeats();
      // refresh unallocated
      const empRes = await api.get('/employees?seatAllocationStatus=pending&limit=100');
      setUnallocatedEmployees(empRes.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDirectRelease = async () => {
    if (!selectedSeat) return;
    if (!window.confirm(`Release seat ${selectedSeat.seatNumber}? Occupant will become unallocated.`)) return;

    setActionSubmitting(true);
    try {
      await api.post(`/seats/${selectedSeat._id}/release`);
      setSelectedSeat(null);
      fetchSeats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Release failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handlePMRequestSubmit = async () => {
    if (!selectedSeat || !assignEmployeeId || !requestReason) {
      alert('Please select employee and provide a reason.');
      return;
    }
    setActionSubmitting(true);
    try {
      await api.post('/seat-requests', {
        type: selectedSeat.status === 'occupied' ? 'transfer' : 'assign',
        employeeId: assignEmployeeId,
        toSeatId: selectedSeat._id,
        reason: requestReason
      });
      setActionSuccessMsg(`Seat request submitted for approval!`);
      setSelectedSeat(null);
      setRequestReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Request submission failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const getSeatBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/20';
      case 'occupied':
        return 'bg-slate-900 border-slate-800 text-white shadow-slate-900/20';
      case 'reserved':
        return 'bg-amber-400 border-amber-500 text-amber-950 shadow-amber-500/20';
      case 'maintenance':
        return 'bg-rose-500 border-rose-600 text-white opacity-60';
      default:
        return 'bg-slate-200 border-slate-300 text-slate-700';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Visual Floor Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any seat to view occupant profile, perform direct assignment (Admin/HR), or request seat transfer (PM)
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-2xs text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-900"></span>
            <span className="text-slate-600">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-slate-600">Reserved Block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Floor Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Floor
          </label>
          <select
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
          >
            {floors.map((fl) => (
              <option key={fl._id} value={fl._id}>
                Floor {fl.floorNumber} ({fl.name})
              </option>
            ))}
          </select>
        </div>

        {/* Zone Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Zone / Wing
          </label>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Zones on Floor</option>
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.zoneName} (Cap: {z.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Seat Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
            <option value="reserved">Reserved Block Only</option>
            <option value="maintenance">Maintenance Only</option>
          </select>
        </div>

        {/* Project Block Tag Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Project Block Tag
          </label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seat Map Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[500px]">
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading floor layout map...</span>
          </div>
        ) : seats.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-sm">
            No seats match the selected floor and zone filters.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-500">
                Displaying <strong>{seats.length}</strong> seats
              </span>
              <span className="text-xs text-slate-400">
                Occupancy: <strong>{seats.filter((s) => s.status === 'occupied').length}</strong> / {seats.length}
              </span>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {seats.map((seat) => (
                <button
                  key={seat._id}
                  onClick={() => {
                    setSelectedSeat(seat);
                    setAssignEmployeeId('');
                    setActionSuccessMsg('');
                  }}
                  className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-between gap-1 shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md ${getSeatBadgeColor(
                    seat.status
                  )}`}
                >
                  <span className="text-[10px] opacity-80">{seat.seatNumber.split('-').pop()}</span>
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] truncate max-w-full">
                    {seat.occupiedBy ? seat.occupiedBy.name.split(' ')[0] : seat.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seat Details & Allocation Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                  Seat {selectedSeat.seatNumber}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Floor {selectedSeat.floorId?.floorNumber} • {selectedSeat.zoneId?.zoneName}
                </h3>
              </div>
              <button onClick={() => setSelectedSeat(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                {actionSuccessMsg}
              </div>
            )}

            {/* Current Occupant Details */}
            {selectedSeat.occupiedBy ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Occupant
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {selectedSeat.occupiedBy.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{selectedSeat.occupiedBy.name}</h4>
                    <p className="text-xs text-slate-500">
                      {selectedSeat.occupiedBy.designation} • {selectedSeat.occupiedBy.department}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-emerald-800 text-xs">
                ✨ Seat is currently <strong>Available</strong> for immediate allocation or request.
              </div>
            )}

            {/* Project Block Tag */}
            {selectedSeat.projectTag && (
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Reserved Block for <strong>{(selectedSeat.projectTag as any).name || (selectedSeat.projectTag as any).code}</strong></span>
              </div>
            )}

            {/* Action Form (Direct for Admin/HR, Request for PM) */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {['admin', 'hr'].includes(user?.role || '') ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Direct Action (Admin / HR)
                  </h4>
                  {selectedSeat.status === 'occupied' ? (
                    <button
                      onClick={handleDirectRelease}
                      disabled={actionSubmitting}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors"
                    >
                      Release Seat (Unassign {selectedSeat.occupiedBy?.name})
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-700">Assign Unallocated Employee</label>
                      <select
                        value={assignEmployeeId}
                        onChange={(e) => setAssignEmployeeId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                      >
                        <option value="">Select Employee...</option>
                        {unallocatedEmployees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.employeeId} - {emp.name} ({emp.department})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleDirectAssign}
                        disabled={!assignEmployeeId || actionSubmitting}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                      >
                        Confirm Direct Assignment
                      </button>
                    </div>
                  )}
                </div>
              ) : user?.role === 'pm' ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Submit Seat Request (Requires HR/Admin Approval)
                  </h4>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700">Select Team Member</label>
                    <select
                      value={assignEmployeeId}
                      onChange={(e) => setAssignEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    >
                      <option value="">Select Employee...</option>
                      {unallocatedEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.employeeId} - {emp.name} ({emp.department})
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="Reason for seat request / transfer..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                    <button
                      onClick={handlePMRequestSubmit}
                      disabled={!assignEmployeeId || !requestReason || actionSubmitting}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Seat Request to Queue
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Read-only view for standard employees. Contact HR or your PM to request a seat transfer.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
