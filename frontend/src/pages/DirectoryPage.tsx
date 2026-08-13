import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  MapPin,
  Briefcase,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  X,
  Mail,
  Phone,
  Grid,
  Eye,
  UserCheck
} from 'lucide-react';
import api from '../services/api';
import { Employee, Project } from '../types';
import { useAuth } from '../context/AuthContext';

export const DirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected row state
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [seatAllocationStatus, setSeatAllocationStatus] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileModalEmp, setProfileModalEmp] = useState<Employee | null>(null);

  // Add Form state
  const [newEmp, setNewEmp] = useState({
    employeeId: `ETH-${Math.floor(50000 + Math.random() * 40000)}`,
    name: '',
    email: '',
    phone: '',
    designation: 'Specialist',
    department: 'Engineering',
    team: 'Frontend Team',
    projectId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, [page, search, department, projectId, status, seatAllocationStatus]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15'
      });

      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (projectId) params.append('projectId', projectId);
      if (status) params.append('status', status);
      if (seatAllocationStatus) params.append('seatAllocationStatus', seatAllocationStatus);

      const res = await api.get(`/employees?${params.toString()}`);
      setEmployees(res.data.data);
      if (res.data.data.length > 0 && !selectedRowId) {
        setSelectedRowId(res.data.data[0]._id);
      }
      setTotalPages(res.data.pagination.pages);
      setTotalRecords(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const payload = {
        ...newEmp,
        projectId: newEmp.projectId ? newEmp.projectId : null
      };

      const res = await api.post('/employees', payload);
      setIsAddModalOpen(false);
      setNewEmp({
        employeeId: `ETH-${Math.floor(50000 + Math.random() * 40000)}`,
        name: '',
        email: '',
        phone: '',
        designation: 'Specialist',
        department: 'Engineering',
        team: 'Frontend Team',
        projectId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active'
      });

      fetchEmployees();
      if (res.data && res.data._id) {
        setSelectedRowId(res.data._id);
      }
    } catch (err: any) {
      console.error('Add Employee Error:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee '${name}'? This will unassign their seat.`)) {
      return;
    }

    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const departments = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Legal'];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Crextio Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">People Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ethara enterprise employee directory & seating matrix ({totalRecords} total workforce records)
          </p>
        </div>

        {/* Add New Employee Button Available for Users */}
        <button
          onClick={() => {
            setFormError('');
            setNewEmp({
              employeeId: `ETH-${Math.floor(50000 + Math.random() * 40000)}`,
              name: '',
              email: '',
              phone: '',
              designation: 'Specialist',
              department: 'Engineering',
              team: 'Frontend Team',
              projectId: '',
              joiningDate: new Date().toISOString().split('T')[0],
              status: 'active'
            });
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-full font-bold text-xs shadow-xs transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-[28px] border border-[#EFE8DC] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 rounded-full text-slate-700 font-semibold focus:outline-none"
          >
            <option value="">Department ⌄</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 rounded-full text-slate-700 font-semibold focus:outline-none"
          >
            <option value="">Project ⌄</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.code}</option>
            ))}
          </select>

          {/* Seat Status Filter */}
          <select
            value={seatAllocationStatus}
            onChange={(e) => {
              setSeatAllocationStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 rounded-full text-slate-700 font-semibold focus:outline-none"
          >
            <option value="">Seat Status ⌄</option>
            <option value="allocated">Allocated</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, ID, email..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* People Directory Table */}
      <div className="bg-white rounded-[32px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading workforce records...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No employees match selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Name & ID</th>
                  <th className="py-4 px-6">Job Title</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Current Seat</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {employees.map((emp) => {
                  const isSelected = selectedRowId === emp._id;
                  return (
                    <tr
                      key={emp._id}
                      onClick={() => {
                        setSelectedRowId(emp._id);
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#FBC48B] text-slate-900 font-bold shadow-2xs'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                              isSelected
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{emp.name}</div>
                            <span className={`text-[10px] ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                              {emp.employeeId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">{emp.designation}</td>
                      <td className="py-4 px-6">{emp.department}</td>
                      <td className="py-4 px-6">
                        {emp.projectId ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              isSelected
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {emp.projectId.code || emp.projectId.name}
                          </span>
                        ) : (
                          <span className="opacity-50 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {emp.seatId ? (
                          <span className="inline-flex items-center gap-1 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-slate-700" />
                            {emp.seatId.seatNumber} (Fl {emp.seatId.floorId?.floorNumber || 1})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full text-[10px]">
                            Pending Seat
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            emp.status === 'active'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          ● {emp.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setProfileModalEmp(emp)}
                            title="View Employee Profile"
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-700" />
                            <span className="hidden sm:inline">Profile</span>
                          </button>

                          <button
                            onClick={() => navigate('/seat-map')}
                            title="View / Assign Seat on Floor Map"
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#FBC48B]" />
                            <span className="hidden sm:inline">{emp.seatId ? 'Map' : 'Assign'}</span>
                          </button>

                          {['admin', 'hr'].includes(user?.role || '') && (
                            <button
                              onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Employee Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} records)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-full hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-full hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Details Profile Modal */}
      {profileModalEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-[#EFE8DC] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                <span>Employee Details Profile</span>
              </h3>
              <button onClick={() => setProfileModalEmp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DC]">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-[#FBC48B] font-bold text-xl flex items-center justify-center shadow-xs border-2 border-[#FBC48B]">
                {profileModalEmp.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{profileModalEmp.name}</h4>
                <p className="text-xs text-slate-500 font-semibold">{profileModalEmp.designation}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-900 text-[#FBC48B] text-[10px] font-bold rounded-full">
                  {profileModalEmp.employeeId}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="font-bold text-slate-800">{profileModalEmp.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Department:</span>
                <span className="font-bold text-slate-800">{profileModalEmp.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Team:</span>
                <span className="font-bold text-slate-800">{profileModalEmp.team}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Assigned Project:</span>
                <span className="font-bold text-slate-800">
                  {profileModalEmp.projectId?.name || profileModalEmp.projectId?.code || 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Current Seat:</span>
                <span className="font-bold text-slate-900">
                  {profileModalEmp.seatId ? `Seat ${profileModalEmp.seatId.seatNumber}` : 'Pending Seat Allocation'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Joining Date:</span>
                <span className="font-bold text-slate-800">
                  {new Date(profileModalEmp.joiningDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setProfileModalEmp(null);
                  navigate('/seat-map');
                }}
                className="px-5 py-2.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on Seat Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-slate-900" />
                <span>Add New Employee</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    value={newEmp.employeeId}
                    onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                    placeholder="ETH-50101"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold bg-slate-50 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="Jane Smith"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="jane.smith@ethara.com"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Designation</label>
                  <input
                    type="text"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    placeholder="Senior Product Specialist"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Assignment</label>
                  <select
                    value={newEmp.projectId}
                    onChange={(e) => setNewEmp({ ...newEmp, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  >
                    <option value="">Unassigned (General Pool)</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
                >
                  {formSubmitting ? 'Saving...' : 'Create Employee Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
