import React, { useEffect, useState } from 'react';
import { spatialService } from '../services/api';
import { Layers, MapPin, Building, CheckCircle, ShieldAlert } from 'lucide-react';

const FloorsZonesPage = () => {
  const [floors, setFloors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFloorsAndZones();
  }, []);

  const fetchFloorsAndZones = async () => {
    try {
      const res = await spatialService.getFloorsAndZones();
      if (res.success) {
        setFloors(res.floors);
        setZones(res.zones);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <span>Floors & Zones Overview</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Building layout, total capacities, and occupancy rates across 5 Floors & 8 Zones
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold">Loading Floor Architecture...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {floors.map((flr) => (
            <div
              key={flr.id}
              className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-sm">
                    F{flr.floorNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{flr.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">Capacity: {flr.totalSeats} seats</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {flr.availableSeats} Available
                  </span>
                  <span className="text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    {flr.occupiedSeats} Occupied
                  </span>
                  <span className="text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-extrabold">
                    {flr.utilizationPercentage}% Utilized
                  </span>
                </div>
              </div>

              {/* Zones Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-4">
                {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H'].map((zName) => (
                  <div
                    key={zName}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center hover:bg-amber-50 hover:border-amber-300 transition-colors"
                  >
                    <p className="font-extrabold text-xs text-slate-900">{zName}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">62 Seats</p>
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
