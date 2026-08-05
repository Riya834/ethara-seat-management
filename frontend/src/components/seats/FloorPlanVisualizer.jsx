import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Search, UserCheck, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const FloorPlanVisualizer = ({ seats = [], onSelectSeat, selectedFloor = 1, onFloorChange }) => {
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [seatSearch, setSeatSearch] = useState('');

  const zones = ['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H'];
  const statuses = ['All', 'Available', 'Occupied', 'Reserved', 'Maintenance'];

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

  const floorSeats = seats.filter((s) => s.floorNumber === selectedFloor);
  const occupiedCount = floorSeats.filter((s) => s.status === 'Occupied').length;
  const availableCount = floorSeats.filter((s) => s.status === 'Available').length;
  const reservedCount = floorSeats.filter((s) => s.status === 'Reserved').length;
  const maintenanceCount = floorSeats.filter((s) => s.status === 'Maintenance').length;
  const occupancyPercent = Math.round((occupiedCount / (floorSeats.length || 1)) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'Occupied':
        return 'bg-slate-800 hover:bg-slate-900 text-white';
      case 'Reserved':
        return 'bg-slate-400 hover:bg-slate-500 text-white';
      case 'Maintenance':
        return 'bg-slate-300 hover:bg-slate-400 text-slate-800';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
      {/* Floor Selection Pills */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-700" />
            <span>Ethara Floor Plan & Seat Grid</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Minimal 2D spatial layout view for Floor {selectedFloor}
          </p>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[1, 2, 3, 4, 5].map((flr) => (
            <button
              key={flr}
              onClick={() => onFloorChange(flr)}
              className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedFloor === flr
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Floor {flr}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Occupancy</p>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{occupancyPercent}%</p>
          </div>
          <UserCheck className="w-4 h-4 text-slate-600" />
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase">Available</p>
            <p className="text-base font-extrabold text-emerald-900 mt-0.5">{availableCount}</p>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-700" />
        </div>

        <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-700 uppercase">Occupied</p>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{occupiedCount}</p>
          </div>
          <UserCheck className="w-4 h-4 text-slate-700" />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Reserved</p>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{reservedCount}</p>
          </div>
          <Clock className="w-4 h-4 text-slate-500" />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Maintenance</p>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">{maintenanceCount}</p>
          </div>
          <ShieldAlert className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Zone & Status Filters Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap my-3">
        {/* Zone Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Zone:
          </span>
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedZone === zone
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'Available' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              {st === 'Occupied' && <span className="w-2 h-2 rounded-full bg-slate-800" />}
              {st === 'Reserved' && <span className="w-2 h-2 rounded-full bg-slate-400" />}
              {st === 'Maintenance' && <span className="w-2 h-2 rounded-full bg-slate-300" />}
              <span>{st}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={seatSearch}
          onChange={(e) => setSeatSearch(e.target.value)}
          placeholder="Filter seats by code or employee name..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      {/* Seat Grid */}
      <div className="min-h-[380px]">
        {filteredSeats.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-xs font-semibold">No seats match the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredSeats.map((seat) => (
              <button
                key={seat.id || seat.seatCode}
                onClick={() => onSelectSeat(seat)}
                title={`${seat.seatCode} (${seat.status}) - ${seat.employeeName || 'Vacant'}`}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 shadow-2xs transition-all cursor-pointer ${getStatusColor(
                  seat.status
                )}`}
              >
                <span className="text-[10px] font-bold leading-tight">
                  {seat.seatCode.split('-')[1]}
                </span>
                <span className="text-[8px] font-medium opacity-90 truncate w-full text-center">
                  {seat.status === 'Occupied' ? seat.employeeName?.split(' ')[0] : seat.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanVisualizer;
