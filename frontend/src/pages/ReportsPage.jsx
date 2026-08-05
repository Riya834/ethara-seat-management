import React from 'react';
import { FileText, Download, Printer, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { employeeService, seatService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ReportsPage = () => {
  const { showToast } = useNotification();

  const handleExportCSV = async () => {
    try {
      const res = await employeeService.getEmployees({ limit: 5000 });
      if (res.success) {
        const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Project', 'Seat Code', 'Floor', 'Zone', 'Status'];
        const rows = res.data.map(e => [
          e.employeeId,
          `"${e.name}"`,
          e.email,
          `"${e.department}"`,
          `"${e.designation}"`,
          `"${e.projectName}"`,
          e.assignedSeatCode || 'Unassigned',
          e.assignedFloor || 'N/A',
          e.assignedZone || 'N/A',
          e.status
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Ethara_Seat_Allocation_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('CSV Audit Report exported successfully!', 'success');
      }
    } catch (err) {
      showToast('Export failed.', 'error');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          <span>Ethara Spatial Audit & Reports Center</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Export full workforce seat utilization, project seat distribution, and unassigned staff reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Workforce Seat Allocation Excel/CSV</h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Export complete 5,000 employee spatial allocation matrix including seat codes, floors, zones, and project tags.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Full CSV Report</span>
          </button>
        </div>

        {/* PDF Print Card */}
        <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 font-bold">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Spatial Executive PDF Overview</h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Generate print-ready executive floor map summary for management and facility compliance audits.
            </p>
          </div>

          <button
            onClick={handlePrintPDF}
            className="mt-6 w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive PDF Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
