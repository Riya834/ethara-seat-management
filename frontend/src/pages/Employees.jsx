import React, { useEffect, useState } from 'react';
import { employeeService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import CSVUploadModal from '../components/employees/CSVUploadModal';
import { 
  Users, 
  Search, 
  UploadCloud, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
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
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <span>Ethara Workforce Directory ({pagination.totalRecords.toLocaleString()})</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Search, filter, and manage seat assignments for 5,000+ employees
          </p>
        </div>

        <button
          onClick={() => setIsCSVOpen(true)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="clay-card p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, EMP ID, seat code, department..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['', 'Unallocated', 'New Joiner', 'Active'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                status === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Employees'}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List Table */}
      <div className="clay-card bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading Directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3 pl-5">Employee</th>
                  <th className="p-3">Department & Role</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Assigned Seat</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{emp.employeeId} • {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{emp.designation}</p>
                      <p className="text-[10px] text-slate-500">{emp.department}</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-semibold text-[11px] border border-slate-200">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {emp.projectName}
                      </span>
                    </td>
                    <td className="p-3">
                      {emp.assignedSeatCode ? (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded-lg font-bold text-xs border border-slate-300">
                          <MapPin className="w-3 h-3 text-slate-600" />
                          {emp.assignedSeatCode} (F{emp.assignedFloor})
                        </span>
                      ) : (
                        <span className="inline-block bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-medium text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          emp.status === 'New Joiner'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} records)
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchEmployees(pagination.page - 1)}
              className="p-1.5 bg-slate-100 rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchEmployees(pagination.page + 1)}
              className="p-1.5 bg-slate-100 rounded-lg disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
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
