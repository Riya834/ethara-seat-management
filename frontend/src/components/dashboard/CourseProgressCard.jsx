import React from 'react';
import { MapPin } from 'lucide-react';

const CourseProgressCard = ({ title, subtitle, progress = 75, date, icon: Icon }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
          <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" />
            {date || 'Live Zone'}
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>

        <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
          {subtitle}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span>Occupancy</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseProgressCard;
