import React, { useEffect, useState } from 'react';
import { spatialService } from '../services/api';
import { Layers } from 'lucide-react';

const FloorsZonesPage = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFloorsAndZones();
  }, []);

  const fetchFloorsAndZones = async () => {
    try {
      const res = await spatialService.getFloorsAndZones();
      if (res.success) {
        setFloors(res.floors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <span>Floors & Zones Overview</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Building layout, total capacities, and occupancy rates across 5 Floors & 8 Zones
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading Architecture...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {floors.map((flr) => (
            <div
              key={flr.id}
              className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm">
                    F{flr.floorNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{flr.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Capacity: {flr.totalSeats} seats</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {flr.availableSeats} Available
                  </span>
                  <span className="text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {flr.occupiedSeats} Occupied
                  </span>
                  <span className="text-slate-900 font-extrabold">
                    {flr.utilizationPercentage}% Utilized
                  </span>
                </div>
              </div>

              {/* Zones Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-3.5">
                {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H'].map((zName) => (
                  <div
                    key={zName}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center hover:bg-slate-100 transition-colors"
                  >
                    <p className="font-bold text-xs text-slate-900">{zName}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">62 Seats</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloorsZonesPage;
