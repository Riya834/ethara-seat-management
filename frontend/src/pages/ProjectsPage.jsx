import React, { useEffect, useState } from 'react';
import { projectService } from '../services/api';
import { Briefcase, Users, MapPin } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (err) {
      showToast('Failed to fetch projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-700" />
          <span>Ethara Delivery Projects ({projects.length})</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Project team allocations and spatial seat distribution
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading Projects Catalogue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const util = Math.round((proj.allocatedSeats / (proj.employeeCount || 1)) * 100);
            return (
              <div
                key={proj.id}
                className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-900 font-extrabold text-xs rounded-md border border-slate-200">
                      {proj.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Client: {proj.client}</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900">{proj.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Manager: <strong>{proj.manager}</strong></p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Team Size:
                    </span>
                    <span>{proj.employeeCount} Members</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Allocated Seats:
                    </span>
                    <span>{proj.allocatedSeats} Seats</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Seat Allocation Rate</span>
                      <span>{util}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-slate-900 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, util)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
