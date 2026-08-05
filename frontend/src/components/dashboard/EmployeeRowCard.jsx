import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';

const EmployeeRowCard = ({ employee, onSelect }) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-3.5 min-w-0">
        <img
          src={employee.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
          alt={employee.name}
          className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 object-cover shrink-0"
        />
        <div className="truncate">
          <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-amber-600 transition-colors">
            {employee.name}
          </h4>
          <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
            {employee.designation} • {employee.department}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Project Tag */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
          <Briefcase className="w-3 h-3 text-slate-400" />
          <span className="truncate max-w-[120px]">{employee.projectName}</span>
        </div>

        {/* Seat Code Tag */}
        <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-200/80">
          <MapPin className="w-3 h-3 text-amber-600" />
          <span>{employee.assignedSeatCode || 'Unassigned'}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(employee)}
          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default EmployeeRowCard;
