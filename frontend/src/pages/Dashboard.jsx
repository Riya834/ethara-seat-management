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
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
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
        setRecentActivities(res.activities || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock sample top allocated employees for "Top Mentors" reference design section
  const sampleEmployees = [
    { name: "Rahul Sharma", designation: "Tech Lead", department: "Engineering", projectName: "Project Alpha", assignedSeatCode: "F2-ZA004", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
    { name: "Priya Verma", designation: "Senior UI Designer", department: "UI/UX Design", projectName: "Horizon Cloud", assignedSeatCode: "F4-ZC012", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { name: "Amit Kapoor", designation: "Data Scientist", department: "Data & AI", projectName: "Smart City Hub", assignedSeatCode: "F5-ZG008", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" },
    { name: "Neha Mehta", designation: "DevOps Architect", department: "Cloud Infra", projectName: "AI Core Suite", assignedSeatCode: "F3-ZD020", photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Loading Spatial Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP SECTION: Progress Cards & Golden Promo Card (Direct reference to Eduhouse top row layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: "Seat Allocation in Progress" */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Seat Allocation in Progress
            </h2>
            <button
              onClick={() => navigate('/seat-map')}
              className="text-xs font-bold text-slate-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              View All Floors <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CourseProgressCard
              title="Engineering North"
              subtitle="Floor 1 & 2 high-density software developer zones."
              progress={stats?.utilizationRate || 84}
              date="Floor 1 & 2"
              icon={Briefcase}
              colorTheme="lavender"
            />

            <CourseProgressCard
              title="AI & Innovation Hub"
              subtitle="Floor 5 neural research & data science labs."
              progress={92}
              date="Floor 5"
              icon={Sparkles}
              colorTheme="peach"
            />

            <CourseProgressCard
              title="Product & Design"
              subtitle="Floor 4 UI/UX and product management center."
              progress={68}
              date="Floor 4"
              icon={Layers}
              colorTheme="sky"
            />
          </div>
        </div>

        {/* Right 1 Column: Golden Promo Card matching reference design subscription box */}
        <div>
          <PromoCard vacantCount={stats?.vacantSeats || 400} totalEmployees={stats?.totalEmployees || 5000} />
        </div>
      </div>

      {/* 2. STATS OVERVIEW RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.04]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Employees</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalEmployees?.toLocaleString()}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
            +5,000 Total
          </span>
        </div>

        <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.04]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>Projects</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalProjects}
          </p>
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
            Active Delivery
          </span>
        </div>

        <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.04]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>Total Seats</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalSeats?.toLocaleString()}
          </p>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
            5 Floors
          </span>
        </div>

        <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.04]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span>Occupied</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.occupiedSeats?.toLocaleString()}
          </p>
          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-1">
            {stats?.utilizationRate}% Utilization
          </span>
        </div>

        <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.04]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Vacant Seats</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            {stats?.vacantSeats?.toLocaleString()}
          </p>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
            Available Now
          </span>
        </div>

        <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-black/[0.04]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <UserPlus className="w-4 h-4 text-amber-600" />
            <span>New Joiners</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">
            {stats?.employeesWithoutSeats?.toLocaleString()}
          </p>
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-1">
            Awaiting Seat
          </span>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Popular Categories & Top Mentors (Direct reference to Eduhouse bottom layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Popular Floor Categories */}
        <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Popular Floor Zones</h3>
              <button onClick={() => navigate('/floors-zones')} className="text-xs font-bold text-amber-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">UI/UX & Product Zone</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Floor 4 • 65 Seats</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  A
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Engineering Core North</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Floor 2 • 500 Seats</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  B
                </span>
              </div>

              <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">AI & Deep Learning Lab</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Floor 5 • 500 Seats</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  C
                </span>
              </div>

              <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Executive & Admin Suite</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Floor 1 • 500 Seats</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                  D
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Top Seat Allocated Employees (Styled like Top Mentors in Eduhouse reference) */}
        <div className="lg:col-span-2 clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Top Allocated Key Personnel</h3>
              <button onClick={() => navigate('/employees')} className="text-xs font-bold text-amber-600 hover:underline">
                View All Employees
              </button>
            </div>

            <div className="space-y-3">
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

      {/* 4. ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor Utilization Chart */}
        <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            <span>Floor Utilization Breakdown (%)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.floorUtilization || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="utilization" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Distribution Chart */}
        <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
            <span>Top Project Seat Allocations</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.projectDistribution || []} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
