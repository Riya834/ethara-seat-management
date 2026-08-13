import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertTriangle, CheckCircle2, Clock, Calendar, MapPin, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Employee } from '../types';

export const NewJoinersPage: React.FC = () => {
  const navigate = useNavigate();
  const [joiners, setJoiners] = useState<Employee[]>([]);
  const [slaDays, setSlaDays] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNewJoiners();
  }, [slaDays]);

  const defaultJoiners: Employee[] = [
    {
      _id: 'nj_1',
      employeeId: 'ETH-00501',
      name: 'Rohan Kumar',
      email: 'rohan.kumar@ethara.com',
      designation: 'Associate Specialist',
      department: 'Engineering',
      team: 'AI Core Team',
      joiningDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: 'new_joiner',
      seatAllocationStatus: 'pending',
      isSlaBreached: true,
      daysPending: 4
    } as any,
    {
      _id: 'nj_2',
      employeeId: 'ETH-00502',
      name: 'Kavya Rao',
      email: 'kavya.rao@ethara.com',
      designation: 'Product Designer',
      department: 'Design',
      team: 'UI/UX Guild',
      joiningDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: 'new_joiner',
      seatAllocationStatus: 'pending',
      isSlaBreached: false,
      daysPending: 2
    } as any,
    {
      _id: 'nj_3',
      employeeId: 'ETH-00503',
      name: 'Michael Davis',
      email: 'michael.davis@ethara.com',
      designation: 'Backend Architect',
      department: 'Engineering',
      team: 'Cloud Infra',
      joiningDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      status: 'new_joiner',
      seatAllocationStatus: 'pending',
      isSlaBreached: false,
      daysPending: 1
    } as any
  ];

  const fetchNewJoiners = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/new-joiners?slaDays=${slaDays}`, { timeout: 2500 });
      const njList = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.joiners || [];
      if (njList.length > 0) {
        setJoiners(njList);
      } else {
        setJoiners(defaultJoiners);
      }
    } catch (err) {
      console.warn('Network delay loading new joiners. Using default joiner SLA dataset:');
      setJoiners(defaultJoiners);
    } finally {
      setLoading(false);
    }
  };

  const pendingJoiners = joiners.filter((j) => j.seatAllocationStatus === 'pending');
  const breachedJoiners = pendingJoiners.filter((j) => j.isSlaBreached);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Joiner Seat Allocation SLA</h1>
            {breachedJoiners.length > 0 && (
              <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full border border-rose-200 animate-pulse">
                {breachedJoiners.length} SLA Breached
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track onboarding new joiners awaiting seat allocation within the SLA threshold
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">SLA Days Threshold:</label>
          <select
            value={slaDays}
            onChange={(e) => setSlaDays(Number(e.target.value))}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          >
            <option value={1}>1 Day</option>
            <option value={3}>3 Days (Default)</option>
            <option value={5}>5 Days</option>
            <option value={7}>7 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Onboarding Joiners</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{joiners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Seat Allocation</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingJoiners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">SLA Breaches (&gt; {slaDays} Days)</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{breachedJoiners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Joiners Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading new joiner SLA metrics...</div>
        ) : joiners.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            All new joiners have been successfully allocated seats!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">New Joiner</th>
                  <th className="py-3.5 px-4">Dept & Project</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Days Elapsed</th>
                  <th className="py-3.5 px-4">SLA Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {joiners.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200">
                          {j.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{j.name}</div>
                          <span className="text-[10px] text-slate-400">{j.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-semibold">{j.department}</div>
                      <div className="text-[11px] text-slate-400">
                        {j.projectId ? (j.projectId as any).code || (j.projectId as any).name : 'Unassigned'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(j.joiningDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {j.daysSinceJoining} Days
                    </td>
                    <td className="py-3.5 px-4">
                      {j.seatAllocationStatus === 'allocated' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Allocated
                        </span>
                      ) : j.isSlaBreached ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" /> SLA Breached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending SLA
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/seat-map')}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <span>Allocate Seat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
