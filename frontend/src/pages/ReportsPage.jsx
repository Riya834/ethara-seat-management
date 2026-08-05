import React from 'react';
import { FileText, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { employeeService } from '../services/api';
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

        showToast('CSV Report exported!', 'success');
      }
    } catch (err) {
      showToast('Export failed.', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Spatial Audit & Reports Center</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Export full workforce seat utilization, project distribution, and unassigned staff reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CSV Export Card */}
        <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-3 font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Workforce Seat Allocation CSV</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Export complete 5,000 employee spatial allocation matrix including seat codes, floors, zones, and project tags.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>

        {/* PDF Print Card */}
        <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-3 font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Spatial Executive PDF Summary</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Generate print-ready executive floor map summary for management and facility audits.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-5 w-full py-2.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
