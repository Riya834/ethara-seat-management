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

  const fetchFeaturedEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=6');
      if (res.data && res.data.data) setEmployees(res.data.data);
    } catch (err) {
      console.error('Failed to load featured employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeData = data || defaultMetrics;
  const { summary, projects } = activeData;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto relative select-none">
      {/* Background Decorative Vector Doodles (Matches Login Page!) */}
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

      {/* Hero Welcome Banner with Full Workplace Illustration & Polka Dots */}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FBC48B] text-slate-900 rounded-full text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
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
              className="px-5 py-3 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Grid className="w-4 h-4 text-slate-900" />
              <span>Interactive Floor Map</span>
            </button>
            {['admin', 'hr'].includes(user?.role || '') && (
              <button
                onClick={() => navigate('/requests')}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-[#FBC48B]" />
                <span>Pending Requests</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side Vector Artwork Card (Matching Login Screen Art Style!) */}
        <div className="z-10 bg-[#FAF7F2] p-5 rounded-[28px] border border-[#EFE8DC] shadow-inner flex items-center gap-5 min-w-[320px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-[#FBC48B] flex items-center justify-center font-bold shadow-md shrink-0">
            <Laptop className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              ● Live Occupancy Status
            </span>
            <h3 className="font-bold text-slate-900 text-base">Ethara HQ Tower A</h3>
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Key Metrics & Utilization</h2>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white rounded-full border border-[#EFE8DC] shadow-2xs">
          <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold flex items-center gap-1.5">
            <span>Occupied</span>
            <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
              {summary?.overallUtilizationPercentage}%
            </span>
          </div>
          <div className="px-4 py-1.5 bg-[#FBC48B] text-slate-900 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span>Available</span>
            <span className="px-1.5 py-0.5 bg-slate-900/10 rounded-full text-[10px]">
              {summary?.availableSeats} Seats
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with Custom Vector Illustrations inside each card! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Utilization Rate */}
        <div className="bg-white p-6 rounded-[32px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-3 relative overflow-hidden group">
          {/* Background Illustration Vector */}
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-20 h-20 text-slate-900" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Utilization Rate
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 z-10 relative">
            <span className="text-3xl font-bold text-slate-900">
              {summary?.overallUtilizationPercentage}%
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Optimal
            </span>
          </div>
          <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-slate-100 z-10 relative">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary?.overallUtilizationPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 z-10 relative">
            {summary?.occupiedSeats} occupied / {summary?.totalSeats} desks
          </p>
        </div>

        {/* Card 2: Vacant Desks */}
        <div className="bg-white p-6 rounded-[32px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-3 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Grid className="w-20 h-20 text-[#FBC48B]" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Seats
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FBC48B] text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <Grid className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 z-10 relative">{summary?.availableSeats}</div>
          <p className="text-xs text-slate-500 z-10 relative">Ready for instant allocation across 10 floors</p>
        </div>

        {/* Card 3: Total Headcount */}
        <div className="bg-white p-6 rounded-[32px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-3 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-20 h-20 text-slate-900" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Workforce Headcount
            </span>
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 z-10 relative">{summary?.totalEmployees}</div>
          <p className="text-xs text-slate-500 z-10 relative">Active workforce & onboarding joiners</p>
        </div>

        {/* Card 4: New Joiner SLA */}
        <div className="bg-white p-6 rounded-[32px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-3 relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-20 h-20 text-rose-500" />
          </div>

          <div className="flex items-center justify-between z-10 relative">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              New Joiner SLA
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                summary?.slaBreachedJoinersCount > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 z-10 relative">
            <span className="text-3xl font-bold text-slate-900">
              {summary?.pendingNewJoinersCount}
            </span>
            {summary?.slaBreachedJoinersCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200">
                {summary.slaBreachedJoinersCount} Breached SLA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 z-10 relative">Pending seat allocation</p>
        </div>
      </div>

      {/* People Directory Card Grid Section with Decorative Vector Accents */}
      <div className="space-y-5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">People Directory</h2>
            <span className="px-3 py-1 bg-[#FBC48B] text-slate-900 text-xs font-bold rounded-full border border-[#f7b674]">
              {summary?.totalEmployees || 5000}+ Employees
            </span>
          </div>
          <button
            onClick={() => navigate('/directory')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#EFE8DC] text-slate-900 font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3x2 People Cards Grid with Illustrated Avatars & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => navigate('/directory')}
              className="bg-white rounded-[28px] p-6 border border-[#EFE8DC] shadow-md shadow-amber-900/5 hover:shadow-lg hover:border-[#FBC48B] transition-all cursor-pointer space-y-4 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Decorative Corner Doodle */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FAF7F2] rounded-full opacity-60 pointer-events-none"></div>

              {/* Top Row: Avatar, Name, Designation & Status */}
              <div className="flex items-start justify-between gap-3 z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-[#FBC48B] font-bold text-lg flex items-center justify-center shadow-xs border-2 border-[#FBC48B] shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-amber-800 transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">{emp.designation}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full shrink-0 border border-emerald-100">
                  ★ 5.0
                </span>
              </div>

              {/* Middle Row: Location/Seat & Department */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-b border-[#FAF7F2] py-3 z-10 relative">
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {emp.seatId ? (
                      <strong className="text-slate-900">Seat {emp.seatId.seatNumber} (Fl {emp.seatId.floorId?.floorNumber || 1})</strong>
                    ) : (
                      <span className="text-amber-700 italic">Seat Pending Allocation</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{emp.department} • {emp.team}</span>
                </div>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5 z-10 relative">
                <span className="px-2.5 py-1 bg-[#FAF7F2] text-slate-700 text-[11px] font-semibold rounded-lg border border-[#EFE8DC]">
                  {emp.department}
                </span>
                {emp.projectId && (
                  <span className="px-2.5 py-1 bg-[#FBC48B]/30 text-slate-900 text-[11px] font-bold rounded-lg">
                    {emp.projectId.code || emp.projectId.name}
                  </span>
                )}
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-lg">
                  +3
                </span>
              </div>

              {/* Bottom Action Button */}
              <div className="pt-2 z-10 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/seat-map');
                  }}
                  className="w-full py-2.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-2xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>View Seat Location</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Block Allocations Section with Blueprint Vector Accents */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 space-y-5 relative overflow-hidden">
        {/* Background Vector Blueprint Line Art */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
            <rect x="20" y="20" width="200" height="200" rx="20" stroke="#0F172A" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="20" y1="120" x2="220" y2="120" stroke="#0F172A" strokeWidth="2" />
            <line x1="120" y1="20" x2="120" y2="220" stroke="#0F172A" strokeWidth="2" />
          </svg>
        </div>

        <div className="flex items-center justify-between z-10 relative">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Project Block Allocations</h3>
            <p className="text-xs text-slate-400">Active team headcounts and block seat assignments across floors</p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 z-10 relative">
          {projects?.slice(0, 6).map((proj: any) => (
            <div
              key={proj.projectId}
              className="p-5 rounded-[24px] border border-[#EFE8DC] bg-[#FAF7F2] hover:bg-[#F3EDE2] transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#FBC48B] text-slate-900 rounded-full uppercase">
                  {proj.projectCode}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {proj.utilizationPercentage}% Utilized
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm truncate">{proj.projectName}</h4>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Headcount: <strong>{proj.totalHeadcount}</strong></span>
                <span>Reserved Block: <strong>{proj.reservedBlockSeats}</strong></span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#FBC48B] h-full rounded-full"
                  style={{ width: `${proj.utilizationPercentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
