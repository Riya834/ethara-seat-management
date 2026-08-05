import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { employeeService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const CSVUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const { showToast } = useNotification();
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sampleCSV = `Name,Email,Department,Designation
Aarav Sharma,aarav.sharma@ethara.com,Engineering,Senior Developer
Diya Patel,diya.patel@ethara.com,Product,Product Manager
Rohan Gupta,rohan.gupta@ethara.com,UI/UX Design,Lead Designer`;

  const handleUpload = async () => {
    if (!csvText.trim()) return;

    setLoading(true);
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const employeesData = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length >= 2) {
          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || '';
          });
          employeesData.push(obj);
        }
      }

      const res = await employeeService.bulkUpload(employeesData);
      if (res.success) {
        showToast(res.message, 'success');
        onRefresh();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'CSV Ingestion failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-extrabold shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Bulk Import Employees (CSV)</h3>
              <p className="text-xs text-slate-500 font-semibold">Ingest multiple employee records instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            Paste CSV Data (Name, Email, Department, Designation)
          </label>
          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={sampleCSV}
            className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          <button
            type="button"
            onClick={() => setCsvText(sampleCSV)}
            className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
          >
            <FileText className="w-3 h-3" /> Load Sample CSV Template
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            disabled={loading || !csvText.trim()}
            onClick={handleUpload}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md disabled:opacity-50"
          >
            {loading ? 'Ingesting...' : 'Import Employees'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
