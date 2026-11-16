import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, Pencil, Plus, RotateCcw, X } from 'lucide-react';
import {
    getMasterProcesses, renameMasterProcess,
    saveMasterProcess, setMasterProcessActive
} from '../services/masterDataService';

export default function ProductionProcessesPanel() {
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');

    const reload = async () => {
        const data = await getMasterProcesses();
        setProcesses(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        let mounted = true;
        getMasterProcesses()
            .then(data => { if (mounted) setProcesses(Array.isArray(data) ? data : []); })
            .catch(() => { if (mounted) toast.error('Gagal mengambil daftar proses produksi.'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const shown = useMemo(() => processes.filter(p =>
        p.processName.toLowerCase().includes(search.toLowerCase())), [processes, search]);
    const activeCount = processes.filter(p => p.isActive).length;

    const resetForm = () => { setDraft(''); setEditingId(null); };

    const submit = async (event) => {
        event.preventDefault();
        const name = draft.trim();
        if (!name) return toast.error('Nama proses wajib diisi.');
        setSaving(true);
        try {
            if (editingId == null) {
                await saveMasterProcess(name);
                toast.success('Proses produksi ditambahkan.');
            } else {
                await renameMasterProcess(editingId, name);
                toast.success('Nama proses diperbarui.');
            }
            resetForm();
            await reload();
        } catch (error) {
            toast.error(error.response?.status === 409
                ? 'Nama duplikat atau sudah dipakai transaksi. Nonaktifkan proses lama dan tambah nama baru.'
                : 'Gagal menyimpan proses produksi.');
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (item) => {
        if (saving) return;
        if (item.isActive && !window.confirm(`Nonaktifkan proses "${item.processName}"? Proses tidak muncul lagi pada input baru.`)) return;
        setSaving(true);
        try {
            await setMasterProcessActive(item.id, !item.isActive);
            await reload();
            toast.success(item.isActive ? 'Proses dinonaktifkan.' : 'Proses diaktifkan kembali.');
        } catch {
            toast.error('Gagal memperbarui status proses.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    {editingId == null ? 'Tambah Proses Baru' : 'Ubah Nama Proses'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Nama proses terpakai dalam laporan lama tidak boleh diganti. Gunakan nonaktifkan + tambah baru.
                </p>
                <form onSubmit={submit} className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Nama Proses
                        <input type="text" maxLength={150} required autoComplete="off"
                            placeholder="Contoh: Piercing" value={draft}
                            onChange={e => setDraft(e.target.value)}
                            className="mt-2 w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" />
                    </label>
                    <button type="submit" disabled={saving || !draft.trim()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                        {editingId == null ? <Plus size={17}/> : <Check size={17}/>}
                        {editingId == null ? 'Simpan Proses' : 'Simpan Perubahan'}
                    </button>
                    {editingId != null && (
                        <button type="button" onClick={resetForm} className="w-full rounded-xl py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                            <X size={16}/> Batal Edit
                        </button>
                    )}
                </form>
            </section>
            <section className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Daftar Proses Produksi</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{activeCount} aktif dari {processes.length} proses</p>
                    </div>
                    <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari proses..." aria-label="Cari proses"
                        className="p-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-300">
                            <tr><th className="p-4">ID</th><th className="p-4">NAMA PROSES</th><th className="p-4">STATUS</th><th className="p-4">AKSI</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                            {shown.map(item => (
                                <tr key={item.id}>
                                    <td className="p-4">{item.id}</td>
                                    <td className="p-4 font-semibold">{item.processName}</td>
                                    <td className="p-4"><span className={item.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{item.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" disabled={saving} aria-label={`Edit ${item.processName}`}
                                                onClick={() => {setEditingId(item.id);setDraft(item.processName);}}
                                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"><Pencil size={16}/></button>
                                            <button type="button" disabled={saving} onClick={() => toggle(item)}
                                                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                                <RotateCcw size={14}/>{item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && shown.length === 0 && <tr><td className="p-6 text-center" colSpan={4}>Tidak ada proses yang cocok.</td></tr>}
                            {loading && <tr><td className="p-6 text-center" colSpan={4}>Memuat proses...</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
