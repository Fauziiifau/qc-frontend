import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';
import HistoryTable from '../components/HistoryTable';

const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

function Reports() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: localDate(new Date(Date.now() - 7 * 86400000)),
        endDate: localDate(new Date()),
        reportType: 'production',
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
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Riwayat dan Export Laporan</h1>
          </header>
          <section className="bg-white dark:bg-slate-800 p-5 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dari Tanggal
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
                  className="block w-full mt-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3" />
              </label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sampai Tanggal
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required
                  className="block w-full mt-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Jenis riwayat">
              {[['production','Riwayat Produksi'],['defect','Riwayat Defect']].map(([value,label])=>(
                <button key={value} type="button" role="tab" aria-selected={formData.reportType===value}
                  onClick={()=>setFormData(old=>({...old,reportType:value}))}
                  className={`px-5 py-3 rounded-xl font-semibold ${formData.reportType===value ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 dark:text-white'}`}>{label}</button>
              ))}
            </div>
            <HistoryTable type={formData.reportType} startDate={formData.startDate} endDate={formData.endDate} />
          </section>
          <section className="bg-white dark:bg-slate-800 p-5 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Export Laporan {formData.reportType==='defect'?'Defect':'Produksi'}</h2>
            <form onSubmit={handleDownload} className="space-y-5">
              <fieldset>
                <legend className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-3">Pilih Jenis Laporan</legend>
                <div className="flex flex-wrap gap-5">
                  {[['pdf','PDF'],['excel','Excel'],['csv','CSV']].map(([value,label])=>(
                    <label key={value} className="flex items-center gap-2 cursor-pointer dark:text-slate-200">
                      <input type="radio" name="format" value={value} checked={formData.format===value} onChange={handleChange} /> {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {hasPhotoOption&&<label className="flex items-center gap-3 text-sm font-semibold dark:text-slate-200">
                <input type="checkbox" name="includePhotos" checked={formData.includePhotos} onChange={handleChange} />
                Sertakan Bukti Foto {formData.format==='csv'?'(referensi file)': '(Excel/PDF)'}
              </label>}
              <button disabled={isLoading || !formData.startDate || !formData.endDate || formData.startDate>formData.endDate}
                type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
                {isLoading?'Generating...':'Generate & Download'}
              </button>
            </form>
          </section>
          {formData.reportType==='defect'&&<p className="text-xs text-slate-500">Riwayat Defect menampilkan NG internal. Endpoint export V2 saat ini dapat pula menyertakan Customer Complaint sesuai implementasi sebelumnya.</p>}
        </div>
      </div>
    );
}

export default Reports;