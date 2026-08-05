import React from 'react';
import { MapPin, Users } from 'lucide-react';

const CourseProgressCard = ({ title, subtitle, progress = 75, date, category, icon: Icon, colorTheme = 'lavender' }) => {
  const themeClasses = {
    lavender: 'bg-[#f2efff] border-indigo-100 text-indigo-900',
    peach: 'bg-[#fff2eb] border-orange-100 text-orange-900',
    sky: 'bg-[#eaf5ff] border-sky-100 text-sky-900',
    mint: 'bg-[#e6f8f3] border-emerald-100 text-emerald-900'
  };

  const progressColors = {
    lavender: 'bg-indigo-600',
    peach: 'bg-orange-500',
    sky: 'bg-sky-500',
    mint: 'bg-emerald-500'
  };

  return (
    <div className={`p-5 rounded-3xl border ${themeClasses[colorTheme] || themeClasses.lavender} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
          <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-black/5 text-[11px]">
            <MapPin className="w-3 h-3 text-amber-500" />
            {date || 'Live Zone Data'}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4 text-slate-700" />
          </div>
        </div>

        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
          <span>Occupancy</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColors[colorTheme] || 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseProgressCard;
