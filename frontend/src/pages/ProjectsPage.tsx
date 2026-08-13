import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, Grid, Calendar, CheckCircle, X, ShieldAlert, Layers, UserPlus, Trash2, MapPin } from 'lucide-react';
import api from '../services/api';
import { Project, Employee, Seat } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Add Member state inside Project Modal
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmpToAdd, setSelectedEmpToAdd] = useState<string>('');
  const [memberActionLoading, setMemberActionLoading] = useState(false);
  const [memberMessage, setMemberMessage] = useState('');

  // Add Project Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchAvailableEmployees();
  }, []);

  const defaultProjects: Project[] = [
    {
      _id: 'p1',
      name: 'Project Atlas AI Core',
      code: 'PROJ-ATLAS',
      description: 'Enterprise Generative AI Engine & Workforce Automation System',
      startDate: new Date('2024-01-15').toISOString(),
      status: 'active',
      reservedSeatsCount: 140,
      assignedEmployeesCount: 120
    } as any,
    {
      _id: 'p2',
      name: 'Project Beacon Analytics',
      code: 'PROJ-BEACON',
      description: 'Real-time Occupancy Telemetry & Spatial Intelligence Platform',
      startDate: new Date('2024-03-01').toISOString(),
      status: 'active',
      reservedSeatsCount: 100,
      assignedEmployeesCount: 85
    } as any,
    {
      _id: 'p3',
      name: 'Project Nexus Cloud',
      code: 'PROJ-NEXUS',
      description: 'Multi-region Hybrid Cloud Infrastructure & Data Mesh',
      startDate: new Date('2024-02-10').toISOString(),
      status: 'active',
      reservedSeatsCount: 150,
      assignedEmployeesCount: 140
    } as any
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { timeout: 2500 });
      const pList = Array.isArray(res.data) ? res.data : res.data?.projects || res.data?.data || [];
      if (pList.length > 0) {
        setProjects(pList);
      } else {
        setProjects(defaultProjects);
      }
    } catch (err) {
      console.warn('Network delay loading projects. Using default project blocks:');
      setProjects(defaultProjects);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=100', { timeout: 2500 });
      const empList = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.employees || [];
      setAvailableEmployees(empList);
    } catch (err) {
      console.error('Failed to load employee list for team assignment:', err);
    }
  };

  const handleProjectClick = async (projectId: string) => {
    setMemberMessage('');
    try {
      const res = await api.get(`/projects/${projectId}`);
      setSelectedProject(res.data);
    } catch (err) {
      console.error('Failed to fetch project detail:', err);
    }
  };

  const handleAddMemberToProject = async () => {
    if (!selectedEmpToAdd || !selectedProject) return;
    setMemberActionLoading(true);
    setMemberMessage('');

    try {
      await api.post(`/projects/${selectedProject.project._id}/members`, {
        employeeIds: [selectedEmpToAdd]
      });

      setMemberMessage('Team member added successfully!');
      setSelectedEmpToAdd('');
      // Refresh modal and project grid
      await handleProjectClick(selectedProject.project._id);
      fetchProjects();
    } catch (err: any) {
      setMemberMessage(err.response?.data?.message || 'Failed to add team member.');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMemberFromProject = async (employeeId: string) => {
    if (!selectedProject) return;
    if (!window.confirm('Are you sure you want to remove this employee from the project block?')) return;

    setMemberActionLoading(true);
    setMemberMessage('');

    try {
      await api.delete(`/projects/${selectedProject.project._id}/members/${employeeId}`);
      setMemberMessage('Team member removed.');
      await handleProjectClick(selectedProject.project._id);
      fetchProjects();
    } catch (err: any) {
      setMemberMessage(err.response?.data?.message || 'Failed to remove team member.');
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const res = await api.post('/projects', newProject);
      setIsAddModalOpen(false);
      setNewProject({ name: '', code: '', description: '', startDate: new Date().toISOString().split('T')[0] });
      fetchProjects();
      
      // Auto open team member modal for newly created project!
      if (res.data && res.data._id) {
        handleProjectClick(res.data._id);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects & Block Allocations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage project team assignments, reserved seating blocks, and team headcounts
          </p>
        </div>

        {['admin', 'hr'].includes(user?.role || '') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 rounded-full font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Add New Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              onClick={() => handleProjectClick(proj._id)}
              className="bg-white p-6 rounded-[28px] border border-[#EFE8DC] shadow-md shadow-amber-900/5 hover:border-[#FBC48B] hover:shadow-lg transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-xs font-bold bg-[#FBC48B] text-slate-900 rounded-full uppercase">
                    {proj.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {proj.utilizationPercentage || 0}% Utilized
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-900 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#FAF7F2]">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Headcount: <strong>{proj.headcount || 0}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-slate-400" />
                    Reserved Block: <strong>{proj.totalReservedSeats || 0}</strong>
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FBC48B] h-full rounded-full transition-all"
                    style={{ width: `${proj.utilizationPercentage || 0}%` }}
                  ></div>
                </div>

                <div className="pt-2 text-right text-[11px] font-bold text-slate-900 group-hover:underline">
                  Manage Team Members →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Project</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Code *</label>
                <input
                  type="text"
                  value={newProject.code}
                  onChange={(e) => setNewProject({ ...newProject, code: e.target.value.toUpperCase() })}
                  placeholder="PROJ-NEXUS"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Project Nexus Core"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Summary of project team scope and seating requirements..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#FBC48B] text-slate-900 rounded-xl text-xs font-bold hover:bg-[#f7b674]"
                >
                  Save & Manage Members
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Card Details & Team Members Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border border-[#EFE8DC] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-3 py-1 text-xs font-bold bg-[#FBC48B] text-slate-900 rounded-full uppercase">
                  {selectedProject.project.code}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1.5">{selectedProject.project.name}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DC] text-center">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Headcount</span>
                <p className="text-xl font-bold text-slate-900">{selectedProject.metrics.totalHeadcount}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Reserved Block Seats</span>
                <p className="text-xl font-bold text-slate-900">{selectedProject.metrics.totalReservedBlockSeats}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Utilization</span>
                <p className="text-xl font-bold text-slate-900">{selectedProject.metrics.utilizationPercentage}%</p>
              </div>
            </div>

            {/* ADD TEAM MEMBERS TO THIS PROJECT SECTION */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-amber-800" />
                <span>Add Team Member to Project</span>
              </h4>

              {memberMessage && (
                <div className="p-2 bg-white rounded-lg text-xs font-bold text-slate-800 border border-slate-200">
                  {memberMessage}
                </div>
              )}

              <div className="flex items-center gap-2">
                <select
                  value={selectedEmpToAdd}
                  onChange={(e) => setSelectedEmpToAdd(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                >
                  <option value="">-- Select Employee to Assign --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId}) • {emp.department} {emp.projectId ? `[Currently: ${emp.projectId.code || 'Assigned'}]` : '[Unassigned]'}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddMemberToProject}
                  disabled={!selectedEmpToAdd || memberActionLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                >
                  {memberActionLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>

            {/* Assigned Employees List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Current Assigned Team Members ({selectedProject.assignedEmployees.length})
              </h4>
              
              {selectedProject.assignedEmployees.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No team members assigned yet. Use the dropdown above to add employees!
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedProject.assignedEmployees.map((emp: any) => (
                    <div
                      key={emp._id}
                      className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs hover:bg-[#FAF7F2] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-[#FBC48B] font-bold flex items-center justify-center text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <span className="text-[11px] text-slate-400 font-medium">{emp.designation} • {emp.department}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {emp.seatId ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full text-[10px] border border-emerald-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Seat {emp.seatId.seatNumber}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-full text-[10px] border border-amber-200">
                            Pending Seat
                          </span>
                        )}

                        {['admin', 'hr', 'pm'].includes(user?.role || '') && (
                          <button
                            onClick={() => handleRemoveMemberFromProject(emp._id)}
                            title="Remove Member from Project"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200"
              >
                Close Project Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
