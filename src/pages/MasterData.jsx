import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import {
    getAllParts, saveMasterPart, deleteMasterPart,
    getMasterMachines, saveMasterMachine, deleteMasterMachine,
    getMasterDefects, saveMasterDefect, deleteMasterDefect
} from '../services/masterDataService';

function MasterData() {
    const [activeTab, setActiveTab] = useState('parts');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parts, setParts] = useState([]);
    const [machines, setMachines] = useState([]);
    const [defects, setDefects] = useState([]);
    const [partForm, setPartForm] = useState({ partNumber: '', partName: '' });
    const [machineForm, setMachineForm] = useState({ name: '', line: 'Stamping' });
    const [defectForm, setDefectForm] = useState({ name: '', category: 'Visual' });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        type: '',
        name: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [partsData, machinesData, defectsData] = await Promise.all([
                getAllParts(), getMasterMachines(), getMasterDefects()
            ]);
            setParts(partsData || []);
            setMachines(machinesData || []);
            setDefects(defectsData || []);
        } catch (error) {
            toast.error("Gagal menarik data dari server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPart = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await saveMasterPart(partForm);
            toast.success("Part berhasil ditambahkan!");
            setPartForm({ partNumber: '', partName: '' });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data || "Gagal menambahkan Part.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddMachine = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await saveMasterMachine(machineForm);
            toast.success("Mesin berhasil ditambahkan!");
            setMachineForm({ name: '', line: 'Stamping' });
            fetchAllData();
        } catch (error) {
            toast.error("Gagal menambahkan Mesin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddDefect = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await saveMasterDefect(defectForm);
            toast.success("Defect berhasil ditambahkan!");
            setDefectForm({ name: '', category: 'Visual' });
            fetchAllData();
        } catch (error) {
            toast.error("Gagal menambahkan Defect.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerDelete = (id, type, name) => {
        setDeleteModal({ isOpen: true, id, type, name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, id: null, type: '', name: '' });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        closeDeleteModal();
        try {
            if (type === 'part') {
                await deleteMasterPart(id);
                toast.success("Part berhasil dihapus.");
            } else if (type === 'machine') {
                await deleteMasterMachine(id);
                toast.success("Mesin berhasil dihapus.");
            } else if (type === 'defect') {
                await deleteMasterDefect(id);
                toast.success("Defect berhasil dihapus.");
            }
            fetchAllData();
        } catch (error) {
            toast.error(`Gagal menghapus data. Mungkin sedang digunakan di tabel lain.`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-slate-500">
                Memuat Master Data...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 transition-colors duration-300 relative">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-800/90 dark:backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Master Data Management</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data untuk Part, Mesin, dan Jenis Defect.</p>
                    </div>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-x-auto w-fit border border-slate-200 dark:border-slate-800">
                    <button onClick={() => setActiveTab('parts')} className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'parts' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        Data Part (Produk)
                    </button>
                    <button onClick={() => setActiveTab('machines')} className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'machines' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        Data Mesin
                    </button>
                    <button onClick={() => setActiveTab('defects')} className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'defects' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        Data Jenis Defect
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800/90 dark:backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                Tambah {activeTab === 'parts' ? 'Part' : activeTab === 'machines' ? 'Mesin' : 'Defect'} Baru
                            </h3>

                            {activeTab === 'parts' && (
                                <form onSubmit={handleAddPart} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Part Number</label>
                                        <input type="text" required value={partForm.partNumber} onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white" placeholder="18311-K1A-N00" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nama Part</label>
                                        <input type="text" required value={partForm.partName} onChange={(e) => setPartForm({ ...partForm, partName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white" placeholder="Stay Center Cover" />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                        Simpan Part
                                    </button>
                                </form>
                            )}

                            {activeTab === 'machines' && (
                                <form onSubmit={handleAddMachine} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nama Mesin</label>
                                        <input type="text" required value={machineForm.name} onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white" placeholder="Amada 1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Production Line</label>
                                        <select value={machineForm.line} onChange={(e) => setMachineForm({ ...machineForm, line: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white cursor-pointer">
                                            <option value="Stamping">Stamping</option>
                                            <option value="Welding Manual">Welding Manual</option>
                                            <option value="Welding Robot">Welding Robot</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                        Simpan Mesin
                                    </button>
                                </form>
                            )}

                            {activeTab === 'defects' && (
                                <form onSubmit={handleAddDefect} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Nama Defect</label>
                                        <input type="text" required value={defectForm.name} onChange={(e) => setDefectForm({ ...defectForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white" placeholder="Baret / Scratch" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
                                        <select value={defectForm.category} onChange={(e) => setDefectForm({ ...defectForm, category: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-white cursor-pointer">
                                            <option value="Visual">Visual</option>
                                            <option value="Functional">Functional</option>
                                            <option value="Dimensional">Dimensional</option>
                                        </select>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                        Simpan Defect
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                                        {activeTab === 'parts' && (
                                            <tr>
                                                <th className="px-6 py-4 w-16">ID</th>
                                                <th className="px-6 py-4">PART NUMBER</th>
                                                <th className="px-6 py-4">NAMA PART</th>
                                                <th className="px-6 py-4 text-center w-24">AKSI</th>
                                            </tr>
                                        )}
                                        {activeTab === 'machines' && (
                                            <tr>
                                                <th className="px-6 py-4 w-16">ID</th>
                                                <th className="px-6 py-4">NAMA MESIN</th>
                                                <th className="px-6 py-4">LINE</th>
                                                <th className="px-6 py-4 text-center w-24">AKSI</th>
                                            </tr>
                                        )}
                                        {activeTab === 'defects' && (
                                            <tr>
                                                <th className="px-6 py-4 w-16">ID</th>
                                                <th className="px-6 py-4">NAMA DEFECT</th>
                                                <th className="px-6 py-4">KATEGORI</th>
                                                <th className="px-6 py-4 text-center w-24">AKSI</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-300">
                                        {activeTab === 'parts' && parts.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-3 font-semibold text-slate-400">{item.id}</td>
                                                <td className="px-6 py-3 font-bold">{item.partNumber}</td>
                                                <td className="px-6 py-3">{item.partName}</td>
                                                <td className="px-6 py-3 flex justify-center">
                                                    <button onClick={() => triggerDelete(item.id, 'part', item.partName)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeTab === 'machines' && machines.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-3 font-semibold text-slate-400">{item.id}</td>
                                                <td className="px-6 py-3 font-bold">{item.name}</td>
                                                <td className="px-6 py-3">{item.line}</td>
                                                <td className="px-6 py-3 flex justify-center">
                                                    <button onClick={() => triggerDelete(item.id, 'machine', item.name)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeTab === 'defects' && defects.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-3 font-semibold text-slate-400">{item.id}</td>
                                                <td className="px-6 py-3 font-bold">{item.name}</td>
                                                <td className="px-6 py-3">{item.category}</td>
                                                <td className="px-6 py-3 flex justify-center">
                                                    <button onClick={() => triggerDelete(item.id, 'defect', item.name)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*NOTIFIKASI*/}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Konfirmasi Hapus</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Apakah Anda yakin ingin menghapus <strong className="text-slate-700 dark:text-slate-200">{deleteModal.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
                            </p>
                        </div>
                        <div className="mt-8 flex gap-3 w-full">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 py-3 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default MasterData;