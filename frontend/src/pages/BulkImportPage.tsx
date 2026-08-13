import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, Play, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../services/api';

export const BulkImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvString, setCsvString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/import/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download CSV template:', err);
    }
  };

  const handleRunImport = async (dryRun: boolean) => {
    if (!file && !csvString.trim()) {
      setErrorMsg('Please select a CSV file or paste CSV text data.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('csvString', csvString);
      }

      const res = await api.post(`/import/csv?dryRun=${dryRun}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setReport(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Import processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk CSV Employee Import</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Import large batches of employees with server-side validation error preview & dry-run testing
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 border border-slate-200"
        >
          <Download className="w-4 h-4" />
          <span>Download Template CSV</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Form Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <span>Upload Employee CSV File</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Drag and Drop / Input */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-xs text-slate-600 font-medium">Select a CSV file from your computer</span>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setCsvString('');
                }
              }}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-xs font-bold text-emerald-600">Selected File: {file.name} ({Math.round(file.size / 1024)} KB)</p>
            )}
          </div>

          {/* Paste Raw CSV Text */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Or Paste CSV Raw Data</label>
            <textarea
              value={csvString}
              onChange={(e) => {
                setCsvString(e.target.value);
                setFile(null);
              }}
              placeholder="employeeId,name,email,phone,designation,department,team,projectCode,joiningDate,status&#10;ETH-00901,Rohan Verma,rohan.verma@ethara.com,+97150999000,Backend Dev,Engineering,API,PROJ-ATLAS,2026-02-01,active"
              rows={5}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => handleRunImport(true)}
            disabled={loading}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Play className="w-4 h-4" />
            <span>Run Dry-Run Validation Test</span>
          </button>
          <button
            onClick={() => handleRunImport(false)}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Commit Bulk Import</span>
          </button>
        </div>
      </div>

      {/* Import Validation Report */}
      {report && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Import Validation Summary</span>
            </h3>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                report.summary.isDryRun ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {report.summary.isDryRun ? 'Dry-Run Test Mode' : 'Committed to Database'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Rows</span>
              <p className="text-xl font-bold text-slate-900">{report.summary.totalRowsProcessed}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold uppercase">Valid Rows</span>
              <p className="text-xl font-bold text-emerald-700">{report.summary.validRowCount}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-xs text-rose-700 font-semibold uppercase">Error Rows</span>
              <p className="text-xl font-bold text-rose-700">{report.summary.errorCount}</p>
            </div>
          </div>

          {/* Errors List */}
          {report.errors.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Row-Level Error Report ({report.errors.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {report.errors.map((err: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-center justify-between">
                    <span>Row {err.rowNumber}: <strong>{err.employeeId || 'N/A'}</strong> - {err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
