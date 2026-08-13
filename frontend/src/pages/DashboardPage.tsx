import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Users,
  Building2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  MapPin,
  Briefcase,
  ArrowRight,
  Laptop,
  Calendar,
  CheckCircle2,
  Layers,
  Award
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Employee } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const defaultMetrics = {
    summary: {
      totalEmployees: 5000,
      totalCapacity: 3450,
      allocatedSeats: 3036,
      unallocatedSeats: 414,
      occupancyRate: 88,
      pendingRequestsCount: 12
    },
    projects: [
      { _id: 'p1', code: 'PROJ-ATLAS', name: 'Project Atlas AI Core', headcount: 120, totalReservedSeats: 140, utilizationPercentage: 92 },
      { _id: 'p2', code: 'PROJ-BEACON', name: 'Project Beacon Analytics', headcount: 85, totalReservedSeats: 100, utilizationPercentage: 88 },
      { _id: 'p3', code: 'PROJ-NEXUS', name: 'Project Nexus Cloud', headcount: 140, totalReservedSeats: 150, utilizationPercentage: 95 }
    ]
  };

  useEffect(() => {
    fetchDashboardData();
    fetchFeaturedEmployees();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultEmployees: Employee[] = [
    {
      _id: 'emp_demo_1',
      employeeId: 'ETH-00001',
      name: 'System Admin',
      email: 'admin@ethara.com',
      designation: 'VP Operations',
      department: 'Operations',
      team: 'Operations Team',
      joiningDate: new Date().toISOString(),
      status: 'active',
      seatAllocationStatus: 'allocated',
      seatId: { _id: 's1', seatNumber: 'F1-ZA-001', floorId: { _id: 'fl1', floorNumber: 1, name: 'Floor 1' } } as any
    },
    {
      _id: 'emp_demo_2',
      employeeId: 'ETH-00002',
      name: 'Sarah HR Lead',
      email: 'hr@ethara.com',
      designation: 'Head of HR',
      department: 'Human Resources',
      team: 'Talent Management',
      joiningDate: new Date().toISOString(),
      status: 'active',
      seatAllocationStatus: 'allocated',
      seatId: { _id: 's2', seatNumber: 'F1-ZA-002', floorId: { _id: 'fl1', floorNumber: 1, name: 'Floor 1' } } as any
    },
    {
      _id: 'emp_demo_3',
      employeeId: 'ETH-00003',
      name: 'Alex PM',
      email: 'pm.atlas@ethara.com',
      designation: 'Senior Technical PM',
      department: 'Engineering',
      team: 'AI Core Team',
      joiningDate: new Date().toISOString(),
      status: 'active',
      seatAllocationStatus: 'allocated',
      seatId: { _id: 's3', seatNumber: 'F2-ZB-015', floorId: { _id: 'fl2', floorNumber: 2, name: 'Floor 2' } } as any
    },
    {
      _id: 'emp_demo_4',
      employeeId: 'ETH-00004',
      name: 'John Doe',
      email: 'emp.john@ethara.com',
      designation: 'Senior Frontend Engineer',
      department: 'Engineering',
      team: 'Frontend Team',
      joiningDate: new Date().toISOString(),
      status: 'active',
      seatAllocationStatus: 'allocated',
      seatId: { _id: 's4', seatNumber: 'F2-ZB-016', floorId: { _id: 'fl2', floorNumber: 2, name: 'Floor 2' } } as any
    },
    {
      _id: 'emp_demo_5',
      employeeId: 'ETH-00005',
      name: 'Priya Sharma',
      email: 'priya.sharma@ethara.com',
      designation: 'Product Designer',
      department: 'Design',
      team: 'UI/UX Guild',
      joiningDate: new Date().toISOString(),
      status: 'active',
      seatAllocationStatus: 'allocated',
      seatId: { _id: 's5', seatNumber: 'F3-ZA-005', floorId: { _id: 'fl3', floorNumber: 3, name: 'Floor 3' } } as any
    },
    {
      _id: 'emp_demo_6',
      employeeId: 'ETH-00006',
      name: 'Aarav Patel',
      email: 'aarav.patel@ethara.com',
      designation: 'DevOps Lead Architect',
      department: 'Engineering',
      team: 'Cloud Infra',
      joiningDate: new Date().toISOString(),
      status: 'active',
      seatAllocationStatus: 'allocated',
      seatId: { _id: 's6', seatNumber: 'F3-ZB-020', floorId: { _id: 'fl3', floorNumber: 3, name: 'Floor 3' } } as any
    }
  ];

  const fetchFeaturedEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=6');
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.employees || [];
      if (list.length > 0) {
        setEmployees(list);
      } else {
        setEmployees(defaultEmployees);
      }
    } catch (err) {
      console.error('Failed to load featured employees:', err);
      setEmployees(defaultEmployees);
    } finally {
      setLoading(false);
    }
  };

  const activeData = data || defaultMetrics;
  const { summary, projects } = activeData;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto relative select-none">
      {/* Background Decorative Vector Doodles */}
      <div className="absolute top-6 right-12 opacity-30 pointer-events-none hidden lg:block">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path d="M10,40 Q60,110 110,20" stroke="#0F172A" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          <circle cx="20" cy="80" r="4" fill="#FBC48B" />
          <circle cx="100" cy="50" r="6" fill="#FBC48B" />
        </svg>
      </div>

      <div className="absolute top-[450px] left-4 opacity-25 pointer-events-none hidden xl:block">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <path d="M5,45 Q45,5 85,45 T165,45" stroke="#0F172A" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-[36px] p-8 border border-[#EFE8DC] shadow-xl shadow-amber-900/5 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Abstract Geometric Polka Dot Accent */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#FBC48B] rounded-[32px] border-2 border-slate-900 pointer-events-none hidden xl:block opacity-90 rotate-6">
          <div className="grid grid-cols-4 gap-2.5 p-4 opacity-30">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#FBC48B] text-slate-900 rounded-full text-[11px] font-bold shadow-2xs">
            <Sparkles className="w-3 h-3" />
            <span>Ethara Enterprise Workplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Real-time seat management, multi-floor occupancy metrics, and project block allocations for 5,000 employees.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/seat-map')}
              className="px-4 py-2.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Grid className="w-3.5 h-3.5 text-slate-900" />
              <span>Interactive Floor Map</span>
            </button>
            {['admin', 'hr'].includes(user?.role || '') && (
              <button
                onClick={() => navigate('/requests')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#FBC48B]" />
                <span>Pending Requests</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side Vector Artwork Card */}
        <div className="z-10 bg-[#FAF7F2] p-4 rounded-[28px] border border-[#EFE8DC] shadow-inner flex items-center gap-4 min-w-[300px]">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-[#FBC48B] flex items-center justify-center font-bold shadow-md shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              ● Live Occupancy Status
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Ethara HQ Tower A</h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-bold">
                10 Floors Active
              </span>
              <span>3,450 Desks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crextio Top Progress Segment Pill Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Key Metrics & Utilization</h2>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white rounded-full border border-[#EFE8DC] shadow-2xs">
          <div className="px-3.5 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold flex items-center gap-1.5">
            <span>Occupied</span>
            <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
              {summary?.overallUtilizationPercentage}%
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-[#FBC48B] text-slate-900 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span>Available</span>
            <span className="px-1.5 py-0.5 bg-slate-900/10 rounded-full text-[10px]">
              {summary?.availableSeats} Seats
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Utilization Rate */}
        <div className="bg-white p-5 rounded-[28px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-2.5 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-slate-900" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Utilization Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 z-10 relative">
            <span className="text-2xl font-bold text-slate-900">
              {summary?.overallUtilizationPercentage}%
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> Optimal
            </span>
          </div>
          <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full overflow-hidden border border-slate-100 z-10 relative">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.overallUtilizationPercentage}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 z-10 relative">
            {summary?.occupiedSeats} occupied / {summary?.totalSeats} desks
          </p>
        </div>

        {/* Card 2: Vacant Desks */}
        <div className="bg-white p-5 rounded-[28px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-2.5 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Grid className="w-12 h-12 text-[#FBC48B]" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Seats
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FBC48B] text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 z-10 relative">{summary?.availableSeats}</div>
          <p className="text-[11px] text-slate-500 z-10 relative">Ready for instant allocation across 10 floors</p>
        </div>

        {/* Card 3: Total Headcount */}
        <div className="bg-white p-5 rounded-[28px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-2.5 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-12 h-12 text-slate-900" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Workforce Headcount
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 z-10 relative">{summary?.totalEmployees}</div>
          <p className="text-[11px] text-slate-500 z-10 relative">Active workforce & onboarding joiners</p>
        </div>

        {/* Card 4: New Joiner SLA */}
        <div className="bg-white p-5 rounded-[28px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-2.5 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              New Joiner SLA
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                summary?.slaBreachedJoinersCount > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 z-10 relative">
            <span className="text-2xl font-bold text-slate-900">
              {summary?.pendingNewJoinersCount}
            </span>
            {summary?.slaBreachedJoinersCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200">
                {summary.slaBreachedJoinersCount} Breached SLA
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 z-10 relative">Pending seat allocation</p>
        </div>
      </div>

      {/* People Directory Card Grid Section */}
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">People Directory</h2>
            <span className="px-2.5 py-0.5 bg-[#FBC48B] text-slate-900 text-[11px] font-bold rounded-full border border-[#f7b674]">
              {summary?.totalEmployees || 5000}+ Employees
            </span>
          </div>
          <button
            onClick={() => navigate('/directory')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-[#EFE8DC] text-slate-900 font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-1"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>

        {/* 3x2 Grid View matching Crextio Design Specs! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.slice(0, 6).map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-[28px] p-5 border border-[#EFE8DC] shadow-md shadow-amber-900/5 hover:border-slate-900 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-slate-900 font-bold text-sm flex items-center justify-center border border-slate-200/80 shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                      {emp.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      {emp.designation}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase">
                  {emp.department}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Employee ID:</span>
                  <span className="font-bold text-slate-900">{emp.employeeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Seat Location:</span>
                  {emp.seatId ? (
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-700" />
                      {emp.seatId.seatNumber} (Fl {emp.seatId.floorId?.floorNumber || 1})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full text-[10px]">
                      Pending Seat
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => navigate('/directory')}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition-all text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate('/seat-map')}
                  className="px-3 py-2 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center justify-center"
                  title="Locate on Map"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Projects Block Allocation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Projects & Reserved Blocks</h2>
          <button
            onClick={() => navigate('/projects')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-[#EFE8DC] text-slate-900 font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-1"
          >
            <span>Manage Projects</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((proj: any) => (
            <div
              key={proj._id}
              className="bg-white p-5 rounded-[28px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-slate-900 text-[#FBC48B] text-[10px] font-bold rounded-full uppercase">
                  {proj.code}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {proj.utilizationPercentage || 90}% Reserved
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{proj.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {proj.headcount || 100} Members Allocated
                </p>
              </div>
              <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full overflow-hidden border border-slate-100">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proj.utilizationPercentage || 90}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
