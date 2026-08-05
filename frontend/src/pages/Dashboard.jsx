import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import CourseProgressCard from '../components/dashboard/CourseProgressCard';
import PromoCard from '../components/dashboard/PromoCard';
import EmployeeRowCard from '../components/dashboard/EmployeeRowCard';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Layers, 
  UserPlus, 
  TrendingUp, 
  BarChart2, 
  PieChart as PieChartIcon,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getStats();
      if (res.success) {
        setStats(res.stats);
        setCharts(res.charts);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleEmployees = [
    { name: "Rahul Sharma", designation: "Tech Lead", department: "Engineering", projectName: "Project Alpha", assignedSeatCode: "F2-ZA004", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
    { name: "Priya Verma", designation: "Senior UI Designer", department: "UI/UX Design", projectName: "Horizon Cloud", assignedSeatCode: "F4-ZC012", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { name: "Amit Kapoor", designation: "Data Scientist", department: "Data & AI", projectName: "Smart City Hub", assignedSeatCode: "F5-ZG008", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" },
    { name: "Neha Mehta", designation: "DevOps Architect", department: "Cloud Infra", projectName: "AI Core Suite", assignedSeatCode: "F3-ZD020", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP SECTION: Progress & Promo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Seat Allocation Overview
            </h2>
            <button
              onClick={() => navigate('/seat-map')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View Floors <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CourseProgressCard
              title="Engineering Hub"
              subtitle="Floor 1 & 2 developer zones."
              progress={stats?.utilizationRate || 84}
              date="Floor 1 & 2"
              icon={Briefcase}
            />

            <CourseProgressCard
              title="AI Research Lab"
              subtitle="Floor 5 neural labs."
              progress={92}
              date="Floor 5"
              icon={Layers}
            />

            <CourseProgressCard
              title="Product & Design"
              subtitle="Floor 4 UI/UX center."
              progress={68}
              date="Floor 4"
              icon={Users}
            />
          </div>
        </div>

        <div>
          <PromoCard vacantCount={stats?.vacantSeats || 400} totalEmployees={stats?.totalEmployees || 5000} />
        </div>
      </div>

      {/* 2. STATS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Employees</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats?.totalEmployees?.toLocaleString()}</p>
        </div>

        <div className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Projects</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats?.totalProjects}</p>
        </div>

        <div className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Seats</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats?.totalSeats?.toLocaleString()}</p>
        </div>

        <div className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Occupied</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats?.occupiedSeats?.toLocaleString()}</p>
        </div>

        <div className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-emerald-800 uppercase">Vacant Seats</p>
          <p className="text-xl font-extrabold text-emerald-900 mt-1">{stats?.vacantSeats?.toLocaleString()}</p>
        </div>

        <div className="clay-card p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Unassigned</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats?.employeesWithoutSeats?.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. POPULAR ZONES & RECENT ALLOCATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Floor Zones</h3>
              <button onClick={() => navigate('/floors-zones')} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                View All
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">UI/UX & Product</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Floor 4 • 65 Seats</p>
                </div>
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  A
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Engineering Core</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Floor 2 • 500 Seats</p>
                </div>
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  B
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">AI Innovation Lab</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Floor 5 • 500 Seats</p>
                </div>
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  C
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Key Personnel Seat Allocations</h3>
              <button onClick={() => navigate('/employees')} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                Directory
              </button>
            </div>

            <div className="space-y-2">
              {sampleEmployees.map((emp, index) => (
                <EmployeeRowCard
                  key={index}
                  employee={emp}
                  onSelect={(e) => navigate(`/employees?search=${encodeURIComponent(e.name)}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-700" />
            <span>Floor Utilization Breakdown (%)</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.floorUtilization || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="utilization" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-slate-700" />
            <span>Top Project Seat Allocations</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.projectDistribution || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#475569" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
