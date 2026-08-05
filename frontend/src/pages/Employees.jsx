import React, { useEffect, useState } from 'react';
import { employeeService, seatService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import CSVUploadModal from '../components/employees/CSVUploadModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  UploadCloud, 
  MapPin, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit3,
  Briefcase
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Employees = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useNotification();
  
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCSVOpen, setIsCSVOpen] = useState(false);

  useEffect(() => {
    fetchEmployees(1);
  }, [search, department, status]);

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({
        page,
        limit: 15,
        search,
        department,
        status
      });
      if (res.success) {
        setEmployees(res.data);
        setPagination({
          page: res.page,
          totalPages: res.totalPages,
          totalRecords: res.totalRecords
        });
      }
    } catch (err) {
      showToast('Failed to load employees list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      try {
        const res = await employeeService.deleteEmployee(id);
        if (res.success) {
          showToast('Employee deleted.', 'success');
          fetchEmployees(pagination.page);
        }
      } catch (err) {
        showToast('Failed to delete employee.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Ethara Workforce Directory ({pagination.totalRecords.toLocaleString()})</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Search, filter, and manage seat assignments for 5,000+ employees
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCSVOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-amber-500" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="clay-card p-4 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, EMP ID, seat code, department..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {['', 'Unallocated', 'New Joiner', 'Active'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                status === st
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Employees'}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List Table */}
      <div className="clay-card bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold">Loading Workforce Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Department & Role</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Assigned Seat</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 object-cover shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{emp.employeeId} • {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-slate-800">{emp.designation}</p>
                      <p className="text-[10px] text-slate-400">{emp.department}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl font-bold text-[11px]">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {emp.projectName}
                      </span>
                    </td>
                    <td className="p-4">
                      {emp.assignedSeatCode ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-xl font-extrabold text-xs border border-amber-200">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {emp.assignedSeatCode} (F{emp.assignedFloor})
                        </span>
                      ) : (
                        <span className="inline-block bg-rose-50 text-rose-700 px-2.5 py-1 rounded-xl font-bold text-[11px] border border-rose-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          emp.status === 'New Joiner'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-semibold">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} records)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchEmployees(pagination.page - 1)}
              className="p-2 bg-slate-100 rounded-xl disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchEmployees(pagination.page + 1)}
              className="p-2 bg-slate-100 rounded-xl disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <CSVUploadModal
        isOpen={isCSVOpen}
        onClose={() => setIsCSVOpen(false)}
        onRefresh={() => fetchEmployees(1)}
      />
    </div>
  );
};

export default Employees;
