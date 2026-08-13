import React, { useState } from 'react';
import { Search, User, Check, X } from 'lucide-react';
import { Employee } from '../types';

interface SearchableEmployeeSelectProps {
  employees: Employee[];
  selectedEmployeeId: string;
  onSelectEmployee: (employeeId: string) => void;
  placeholder?: string;
}

export const SearchableEmployeeSelect: React.FC<SearchableEmployeeSelectProps> = ({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  placeholder = 'Type employee name or ID to filter...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      (emp.designation && emp.designation.toLowerCase().includes(q))
    );
  });

  const selectedEmp = employees.find((e) => e._id === selectedEmployeeId);

  return (
    <div className="space-y-2 relative">
      {/* Typing Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-medium text-slate-900 placeholder-slate-400"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Employee Pill */}
      {selectedEmp && (
        <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              {selectedEmp.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-slate-900">{selectedEmp.name}</span>
              <span className="text-[11px] text-slate-500 ml-1.5">({selectedEmp.employeeId}) • {selectedEmp.department}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md">Selected</span>
        </div>
      )}

      {/* Dropdown Employee List */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
          {filteredEmployees.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching employees found for "{searchTerm}".
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <button
                key={emp._id}
                type="button"
                onClick={() => {
                  onSelectEmployee(emp._id);
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  selectedEmployeeId === emp._id ? 'bg-blue-50/50 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-[#FBC48B] font-bold flex items-center justify-center text-xs shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {emp.name} <span className="text-slate-400 font-normal">({emp.employeeId})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {emp.designation || 'Specialist'} • {emp.department}
                    </div>
                  </div>
                </div>

                {selectedEmployeeId === emp._id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
