import React, { useState } from 'react';

import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';

function Reports() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reportType: 'defect',
        format: 'pdf'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDownload = async (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate) {
            toast.error("Mohon isi Start Date dan End Date terlebih dahulu!");
            return;
        }

        if (formData.startDate > formData.endDate) {
            toast.error("Start Date tidak boleh lebih besar dari End Date!");
            return;
        }

        setIsLoading(true);
        try {
            let endpoint = '';
            let mimeType = '';
            let fileExtension = '';
            if (formData.format === 'pdf') {
                mimeType = 'application/pdf';
                fileExtension = 'pdf';
            } else if (formData.format === 'csv') {
                mimeType = 'text/csv';
                fileExtension = 'csv';
            } else if (formData.format === 'excel') {
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                fileExtension = 'xlsx';
            }
            if (formData.reportType === 'defect') {
                if (formData.format === 'pdf') endpoint = '/reports/download-ng-data-pdf';
                else if (formData.format === 'csv') endpoint = '/reports/download-ng-data';
                else if (formData.format === 'excel') endpoint = '/reports/download-ng-data-excel';
            }
            else if (formData.reportType === 'production') {
                if (formData.format === 'pdf') endpoint = '/reports/download-production-pdf';
                else if (formData.format === 'csv') endpoint = '/reports/download-production-csv';
                else if (formData.format === 'excel') endpoint = '/reports/download-production-excel';
            }
            const response = await api.get(endpoint, {
                responseType: 'blob',
                params: {
                    startDate: formData.startDate,
                    endDate: formData.endDate
                }
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
            const link = document.createElement('a');
            link.href = url;
            const reportName = formData.reportType === 'defect' ? 'Laporan_Defect' : 'Laporan_Produksi';
            link.setAttribute('download', `QC_${reportName}_${formData.startDate}_to_${formData.endDate}.${fileExtension}`);

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`File ${formData.format.toUpperCase()} berhasil di-download!`);
        } catch (error) {
            console.error("Download error:", error);
            if (error.response && error.response.status === 404) {
                toast.error(`Fitur laporan ini belum tersedia di Backend (Error 404).`);
            } else {
                toast.error("Gagal mengunduh laporan. Pastikan server backend berjalan.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* HEADER */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 transition-all">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Export Laporan Defect Product dan Laporan Produksi</h1>
                        <p className="text-sm text-slate-400 mt-1">Export quality control analytics.</p>
                    </div>
                </div>
                {/* FORM CARD */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 transition-all">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Generate Custom Report</h2>

                    <form onSubmit={handleDownload} className="space-y-6">
                        {/* ROW 1: DATES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-700 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-700 transition-all"
                                    required
                                />
                            </div>
                        </div>
                        {/* ROW 2: REPORT TYPE */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                Report Type
                            </label>
                            <select
                                name="reportType"
                                value={formData.reportType}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-700 transition-all font-semibold"
                            >
                                <option value="defect">Laporan Defect (Internal & Komplain Customer)</option>
                                <option value="production">Laporan Produksi</option>
                            </select>
                        </div>
                        {/* ROW 3: FORMAT (RADIO BUTTONS) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Format Laporan</label>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                <label className="flex items-center gap-3 cursor-pointer group p-2 pr-4 rounded-lg hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="pdf"
                                        checked={formData.format === 'pdf'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">PDF Document</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group p-2 pr-4 rounded-lg hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="excel"
                                        checked={formData.format === 'excel'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Excel Spreadsheet</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group p-2 pr-4 rounded-lg hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="csv"
                                        checked={formData.format === 'csv'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">CSV Data</span>
                                </label>
                            </div>
                        </div>

                        {/* ROW 4: BUTTONS */}
                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : null}
                                {isLoading ? 'Generating...' : 'Generate & Download'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Reports;