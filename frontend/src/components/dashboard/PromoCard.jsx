import React from 'react';
import { Building, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PromoCard = ({ vacantCount = 400, totalEmployees = 5000 }) => {
  const navigate = useNavigate();

  return (
    <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#fff6e5] to-[#ffebd0] border border-amber-200/60 shadow-md flex flex-col justify-between overflow-hidden">
      {/* Decorative 3D Spatial Building Element */}
      <div className="absolute -top-3 -right-3 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-900 shadow-md shadow-amber-400/40 mb-4">
          <Building className="w-7 h-7 stroke-[2.5]" />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
          {vacantCount} Seats Available
        </h3>
        <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
          Ready for immediate assignment across 5 Floors & 8 Zones for {totalEmployees.toLocaleString()} employees.
        </p>
      </div>

      <div className="relative z-10 mt-6">
        <button
          onClick={() => navigate('/seat-map')}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
        >
          <span>Open Spatial Map</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoCard;
