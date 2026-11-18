import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';

function Reports() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reportType: 'defect',
        format: 'pdf',
        includePhotos: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDownload = async (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) {
            toast.error('Mohon isi Start Date dan End Date terlebih dahulu!');
            return;
        }
        if (formData.startDate > formData.endDate) {
            toast.error('Start Date tidak boleh lebih besar dari End Date!');
            return;
        }
        setIsLoading(true);
        try {
            const options = {
                pdf: { ext: 'pdf', mime: 'application/pdf' },
                csv: { ext: 'csv', mime: 'text/csv;charset=UTF-8' },
                excel: { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            };
            const endpoints = {
                defect: {
                    pdf: '/reports/v2/download-ng-data-pdf',
                    csv: '/reports/v2/download-ng-data',
                    excel: '/reports/v2/download-ng-data-excel',
                },
                production: {
                    pdf: '/reports/v2/download-production-pdf',
                    csv: '/reports/v2/download-production-csv',
                    excel: '/reports/v2/download-production-excel',
                },
            };
            const output = options[formData.format];
            const endpoint = endpoints[formData.reportType]?.[formData.format];
            if (!endpoint || !output) throw new Error('Jenis laporan atau format tidak didukung');

            const response = await api.get(endpoint, {
                responseType: 'blob',
                timeout: formData.reportType === 'defect' && formData.includePhotos ? 120000 : 60000,
                params: {
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    ...(formData.reportType === 'defect' ? { includePhotos: formData.includePhotos } : {}),
                },
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: output.mime }));
            const link = document.createElement('a');
            link.href = url;
            const name = formData.reportType === 'defect' ? 'Laporan_Defect' : 'Laporan_Produksi';
            link.download = `QC_${name}_${formData.startDate}_to_${formData.endDate}.${output.ext}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            toast.success(`Laporan ${formData.format.toUpperCase()} berhasil diunduh.`);
        } catch (error) {
            console.error('Download error:', error);
            if (error.response?.status === 404) {
                toast.error('Endpoint laporan belum tersedia pada backend.');
            } else if (error.response?.status === 400) {
                toast.error('Rentang tanggal laporan tidak valid.');
            } else {
                toast.error('Gagal mengunduh laporan. Periksa koneksi backend dan konfigurasi foto.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const hasPhotoOption = formData.reportType === 'defect';

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Export Laporan Defect Product dan Laporan Produksi
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Ekspor laporan berdasarkan tanggal; foto hanya ditambahkan ke file laporan, bukan ditampilkan di website.
                    </p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Generate Custom Report</h2>
                    <form onSubmit={handleDownload} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Start Date</label>
                                <input id="startDate" type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-700 dark:text-slate-200"
                                    required />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">End Date</label>
                                <input id="endDate" type="date" name="endDate" value={formData.endDate} onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-700 dark:text-slate-200"
                                    required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reportType" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Report Type</label>
                            <select id="reportType" name="reportType" value={formData.reportType} onChange={handleChange}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl outline-none text-slate-700 dark:text-slate-200 font-semibold">
                                <option value="defect">Laporan Defect (Internal & Komplain Customer)</option>
                                <option value="production">Laporan Produksi</option>
                            </select>
                        </div>
                        <fieldset>
                            <legend className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Format Laporan</legend>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                {[
                                    ['pdf', 'PDF Document'],
                                    ['excel', 'Excel Spreadsheet'],
                                    ['csv', 'CSV Data'],
                                ].map(([value, title]) => (
                                    <label key={value} className="flex items-center gap-3 cursor-pointer p-2 pr-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <input type="radio" name="format" value={value} checked={formData.format === value}
                                            onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        {hasPhotoOption ? (
                            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="includePhotos" checked={formData.includePhotos} onChange={handleChange}
                                        className="h-5 w-5 accent-blue-600" />
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Sertakan Bukti Foto</span>
                                </label>
                                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                                    {formData.format === 'csv'
                                        ? 'CSV menyimpan path/nama foto sebagai teks, bukan gambar di dalam file.'
                                        : 'Foto tersedia akan disisipkan langsung ke dokumen Excel atau lampiran PDF.'}
                                    {' '}Data tanpa foto tetap diekspor.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-amber-700 dark:text-amber-300 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4">
                                Foto khusus produksi belum dapat disertakan karena tabel production_data belum menyimpan referensi foto.
                            </p>
                        )}
                        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
                            <button type="submit" disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                {isLoading && <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5" />}
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