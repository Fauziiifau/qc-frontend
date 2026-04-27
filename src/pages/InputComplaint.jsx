import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { saveComplaint } from '../services/complaintService';
import { getAllParts, getAllDefects } from '../services/masterDataService';

const getTodayDate = () => new Date().toISOString().split('T')[0];

function InputComplaint() {
    const [isLoading, setIsLoading] = useState(false);
    const [partOptions, setPartOptions] = useState([]);
    const [defectOptions, setDefectOptions] = useState([]);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [searchPart, setSearchPart] = useState('');
    const [showPartDropdown, setShowPartDropdown] = useState(false);
    const [searchDefect, setSearchDefect] = useState('');
    const [showDefectDropdown, setShowDefectDropdown] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [formData, setFormData] = useState({
        complaintDate: getTodayDate(),
        customerName: '',
        partId: '',
        defectTypeId: '',
        lotNumber: '',
        defectQuantity: '',
        problemDescription: ''
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [parts, defects] = await Promise.all([
                    getAllParts().catch(() => []),
                    getAllDefects().catch(() => [])
                ]);
                setPartOptions(parts || []);
                setDefectOptions(defects || []);
            } catch (error) {
                toast.error("Gagal memuat data Master");
            }
        };
        fetchMasterData();
    }, []);

    const filteredParts = partOptions.filter(p =>
        p.partNumber.toLowerCase().includes(searchPart.toLowerCase()) ||
        p.partName.toLowerCase().includes(searchPart.toLowerCase())
    );

    const filteredDefects = defectOptions.filter(d =>
        d.name?.toLowerCase().includes(searchDefect.toLowerCase())
    );

    const handleSelectPart = (part) => {
        setFormData({ ...formData, partId: part.id });
        setSearchPart(`${part.partNumber} - ${part.partName}`);
        setShowPartDropdown(false);
    };

    const handleSelectDefect = (defect) => {
        setFormData({ ...formData, defectTypeId: defect.id });
        setSearchDefect(defect.name);
        setShowDefectDropdown(false);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSizeInBytes = 5 * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                toast.error("Ukuran foto terlalu besar! Maksimal 5MB.");
                e.target.value = null;
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();

        if (!formData.partId) {
            toast.error("Mohon pilih Part dari daftar terlebih dahulu!");
            return;
        }
        if (!formData.defectTypeId) {
            toast.error("Mohon pilih Jenis Cacat dari daftar terlebih dahulu!");
            return;
        }

        setConfirmModal(true);
    };

    const submitData = async () => {
        setConfirmModal(false);
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                partId: parseInt(formData.partId),
                defectTypeId: parseInt(formData.defectTypeId),
                defectQuantity: parseInt(formData.defectQuantity)
            };

            await saveComplaint(payload, photoFile);
            toast.success("Berhasil! Data komplain pelanggan telah dicatat.");
            setFormData({
                complaintDate: getTodayDate(), customerName: '', partId: '', defectTypeId: '', lotNumber: '', defectQuantity: '', problemDescription: ''
            });
            setSearchPart('');
            setSearchDefect('');
            removePhoto();
        } catch (error) {
            toast.error("Gagal menyimpan data komplain.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 relative">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-all">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Customer Complaint Form</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Catat laporan retur atau komplain kualitas beserta bukti foto.</p>
                    </div>
                </div>
                {/* FORM INPUT KOMPLAIN */}
                <form onSubmit={handlePreSubmit} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-all">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> Tanggal Klaim / Retur *</label>
                            <input type="date" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-800 dark:text-white" value={formData.complaintDate} onChange={(e) => setFormData({ ...formData, complaintDate: e.target.value })} required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> Nama Customer *</label>
                            <input type="text" placeholder="Contoh: PT. Roda Prima Lancar" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> Cari Nama Part / Number *</label>
                            <input
                                type="text"
                                placeholder="Ketik nama part atau nomor..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                                value={searchPart}
                                onChange={(e) => {
                                    setSearchPart(e.target.value);
                                    setShowPartDropdown(true);
                                    setFormData({ ...formData, partId: '' });
                                }}
                                onFocus={() => setShowPartDropdown(true)}
                                onBlur={() => setTimeout(() => setShowPartDropdown(false), 200)}
                                required={!formData.partId}
                            />
                            {showPartDropdown && (
                                <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-xl max-h-60 overflow-auto rounded-xl mt-2 divide-y divide-slate-50 dark:divide-slate-700">
                                    {filteredParts.length > 0 ? (
                                        filteredParts.map(p => (
                                            <li key={p.id} onClick={() => handleSelectPart(p)} className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                                <div className="font-bold text-slate-700 dark:text-white">{p.partNumber}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">{p.partName}</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Part tidak ditemukan</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> Cari Jenis Cacat *</label>
                            <input
                                type="text"
                                placeholder="Ketik jenis masalah..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                                value={searchDefect}
                                onChange={(e) => {
                                    setSearchDefect(e.target.value);
                                    setShowDefectDropdown(true);
                                    setFormData({ ...formData, defectTypeId: '' });
                                }}
                                onFocus={() => setShowDefectDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDefectDropdown(false), 200)}
                                required={!formData.defectTypeId}
                            />
                            {showDefectDropdown && (
                                <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-xl max-h-60 overflow-auto rounded-xl mt-2 divide-y divide-slate-50 dark:divide-slate-700">
                                    {filteredDefects.length > 0 ? (
                                        filteredDefects.map(d => (
                                            <li key={d.id} onClick={() => handleSelectDefect(d)} className="p-3 hover:bg-rose-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                                <div className="font-bold text-slate-700 dark:text-white">{d.name}</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Jenis cacat tidak ditemukan</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> No. Lot Produksi *</label>
                            <input type="text" placeholder="Untuk pelacakan traceability..." className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" value={formData.lotNumber} onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })} required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> Jumlah NG (Qty Retur) *</label>
                            <input type="number" min="1" placeholder="Jumlah Quantity" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" value={formData.defectQuantity} onChange={(e) => setFormData({ ...formData, defectQuantity: e.target.value })} required />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"> Deskripsi Masalah *</label>
                            <input type="text" placeholder="Deskripsi Masalah " className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" value={formData.problemDescription} onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })} required />
                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Upload Bukti Foto</label>

                        {!photoPreview ? (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer relative">
                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">Klik atau seret foto ke sini</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">Format: JPG, PNG (Maks 5MB)</p>
                            </div>
                        ) : (
                            <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                <img src={photoPreview} alt="Preview Bukti" className="h-48 w-auto object-contain rounded-lg" />
                                <button type="button" onClick={removePhoto} className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600 shadow-md transition-all active:scale-95 font-bold">
                                    X
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20">
                            {isLoading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : null}
                            {isLoading ? 'Menyimpan...' : 'Simpan Laporan Komplain'}
                        </button>
                    </div>
                </form>
            </div>

            {/*NOTIFIKASI*/}
            {confirmModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Konfirmasi Simpan</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Apakah Anda yakin laporan <strong className="text-slate-700 dark:text-slate-200">Customer Complaint</strong> ini sudah lengkap dan siap untuk dikirim?
                            </p>
                        </div>
                        <div className="mt-8 flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmModal(false)}
                                className="flex-1 py-3 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                            >
                                Cek Lagi
                            </button>
                            <button
                                onClick={submitData}
                                className="flex-1 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                            >
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
export default InputComplaint;