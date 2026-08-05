import React from 'react';
import { Building, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PromoCard = ({ vacantCount = 400, totalEmployees = 5000 }) => {
  const navigate = useNavigate();

  return (
    <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white mb-4">
          <Building className="w-5 h-5" />
        </div>

        <h3 className="text-base font-extrabold tracking-tight">
          {vacantCount} Seats Available
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
          Ready for immediate allocation across 5 Floors & 8 Zones for {totalEmployees.toLocaleString()} employees.
        </p>
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate('/seat-map')}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span>Open Spatial Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PromoCard;
