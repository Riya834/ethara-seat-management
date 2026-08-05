import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Search, UserCheck, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const FloorPlanVisualizer = ({ seats = [], onSelectSeat, selectedFloor = 1, onFloorChange }) => {
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [seatSearch, setSeatSearch] = useState('');

  const zones = ['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H'];
  const statuses = ['All', 'Available', 'Occupied', 'Reserved', 'Maintenance'];

  // Filter seats based on current floor, zone, status, search
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      const matchFloor = seat.floorNumber === selectedFloor;
      const matchZone = selectedZone === 'All' || seat.zone === selectedZone;
      const matchStatus = selectedStatus === 'All' || seat.status === selectedStatus;
      const matchSearch =
        !seatSearch ||
        seat.seatCode.toLowerCase().includes(seatSearch.toLowerCase()) ||
        (seat.employeeName && seat.employeeName.toLowerCase().includes(seatSearch.toLowerCase())) ||
        (seat.projectName && seat.projectName.toLowerCase().includes(seatSearch.toLowerCase()));

      return matchFloor && matchZone && matchStatus && matchSearch;
    });
  }, [seats, selectedFloor, selectedZone, selectedStatus, seatSearch]);

  // Floor stats
  const floorSeats = seats.filter((s) => s.floorNumber === selectedFloor);
  const occupiedCount = floorSeats.filter((s) => s.status === 'Occupied').length;
  const availableCount = floorSeats.filter((s) => s.status === 'Available').length;
  const reservedCount = floorSeats.filter((s) => s.status === 'Reserved').length;
  const maintenanceCount = floorSeats.filter((s) => s.status === 'Maintenance').length;
  const occupancyPercent = Math.round((occupiedCount / (floorSeats.length || 1)) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20';
      case 'Occupied':
        return 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20';
      case 'Reserved':
        return 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20';
      case 'Maintenance':
        return 'bg-slate-400 hover:bg-slate-500 text-white shadow-slate-400/20';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay">
      {/* Floor Selection Pills */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <span>Ethara Floor Plan & Seat Grid</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time interactive 2D spatial view for Floor {selectedFloor}
          </p>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-full border border-slate-200/60">
          {[1, 2, 3, 4, 5].map((flr) => (
            <button
              key={flr}
              onClick={() => onFloorChange(flr)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 ${
                selectedFloor === flr
                  ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Floor {flr}
            </button>
          ))}
        </div>
      </div>

      {/* Floor Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5">
        <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Occupancy Rate</p>
            <p className="text-lg font-extrabold text-indigo-900 mt-0.5">{occupancyPercent}%</p>
          </div>
          <UserCheck className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Available</p>
            <p className="text-lg font-extrabold text-emerald-900 mt-0.5">{availableCount}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Occupied</p>
            <p className="text-lg font-extrabold text-rose-900 mt-0.5">{occupiedCount}</p>
          </div>
          <UserCheck className="w-5 h-5 text-rose-600" />
        </div>

        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Reserved</p>
            <p className="text-lg font-extrabold text-amber-900 mt-0.5">{reservedCount}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>

        <div className="p-3.5 bg-slate-100/70 rounded-2xl border border-slate-200 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Maintenance</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{maintenanceCount}</p>
          </div>
          <ShieldAlert className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Zone & Status Filters Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap my-4">
        {/* Zone Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Zone:
          </span>
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedZone === zone
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Status Legend & Filters */}
        <div className="flex items-center gap-2">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                selectedStatus === st
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'Available' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              {st === 'Occupied' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
              {st === 'Reserved' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              {st === 'Maintenance' && <span className="w-2 h-2 rounded-full bg-slate-400" />}
              <span>{st}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Seat Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={seatSearch}
          onChange={(e) => setSeatSearch(e.target.value)}
          placeholder="Filter seats by code or employee name..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      {/* Seat Grid Display */}
      <div className="min-h-[400px]">
        {filteredSeats.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-sm font-semibold">No seats match the selected floor, zone, or status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredSeats.map((seat) => (
              <motion.button
                key={seat.id || seat.seatCode}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSeat(seat)}
                title={`${seat.seatCode} (${seat.status}) - ${seat.employeeName || 'Vacant'}`}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 shadow-sm transition-all relative group cursor-pointer ${getStatusColor(
                  seat.status
                )}`}
              >
                <span className="text-[11px] font-extrabold tracking-tighter leading-tight">
                  {seat.seatCode.split('-')[1]}
                </span>
                <span className="text-[9px] font-semibold opacity-95 truncate w-full text-center">
                  {seat.status === 'Occupied' ? seat.employeeName?.split(' ')[0] : seat.status}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanVisualizer;
