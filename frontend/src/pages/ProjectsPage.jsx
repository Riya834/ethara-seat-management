import React, { useEffect, useState } from 'react';
import { projectService } from '../services/api';
import { Briefcase, Users, MapPin, Plus, UserCheck } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            <span>Ethara Delivery Projects ({projects.length})</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Project team allocations, client accounts, and spatial seat distribution
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Loading Projects Catalogue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const util = Math.round((proj.allocatedSeats / (proj.employeeCount || 1)) * 100);
            return (
              <div
                key={proj.id}
                className="clay-card p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex flex-col justify-between hover:border-amber-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-amber-100/80 text-amber-900 font-extrabold text-xs rounded-full border border-amber-200">
                      {proj.code}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Client: {proj.client}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{proj.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Manager: <strong>{proj.manager}</strong></p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-4 h-4 text-amber-500" /> Team Size:
                    </span>
                    <span>{proj.employeeCount} Employees</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-4 h-4 text-emerald-500" /> Allocated Seats:
                    </span>
                    <span>{proj.allocatedSeats} Seats</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>Seat Allocation</span>
                      <span>{util}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
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
