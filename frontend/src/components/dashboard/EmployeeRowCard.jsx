import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';

const EmployeeRowCard = ({ employee, onSelect }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={employee.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
          alt={employee.name}
          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
        />
        <div className="truncate">
          <h4 className="font-extrabold text-xs text-slate-900 truncate">
            {employee.name}
          </h4>
          <p className="text-[11px] font-medium text-slate-500 truncate">
            {employee.designation} • {employee.department}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Project Tag */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Briefcase className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[120px]">{employee.projectName}</span>
        </div>

        {/* Seat Code Tag */}
        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span>{employee.assignedSeatCode || 'Unassigned'}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(employee)}
          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default EmployeeRowCard;
