import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

const boxStyle = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white';
const dateText = (v) => typeof v === 'string' ? v.slice(0, 10) : '';

export default function HistoryTable({ type, startDate, endDate }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reason, setReason] = useState('');
  const [masters, setMasters] = useState({ parts: [], defects: [] });
  const isAdmin = localStorage.getItem('user_role') === 'ADMIN';

  const reload = async () => {
    if (!startDate || !endDate || startDate > endDate) { setRows([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/history/${type}`, { params: { startDate, endDate } });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal memuat riwayat. Periksa API /history.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    if (!startDate || !endDate || startDate > endDate) return;
    api.get(`/history/${type}`, { params: { startDate, endDate } })
      .then(({ data }) => { if (active) setRows(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) toast.error('Gagal memuat riwayat'); });
    return () => { active = false; };
  }, [type, startDate, endDate]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    Promise.all([api.get('/parts'), api.get('/defects')])
      .then(([p, d]) => { if (active) setMasters({parts: p.data || [], defects: d.data || []}); })
      .catch(() => { if (active) toast.error('Gagal memuat master part/defect untuk koreksi'); });
    return () => { active = false; };
  }, [isAdmin]);

  const startEdit = (r) => { setEditing({ ...r }); setReason(''); };
  const save = async () => {
    if (!editing || reason.trim().length < 5) return toast.error('Alasan koreksi minimal 5 karakter');
    const data = type === 'production' ? {
      productionDate: dateText(editing.productionDate), shift: editing.shift,
      partId: Number(editing.partId), processName: editing.processName || null,
      machineName: editing.machineName || null,
      targetQuantity: Number(editing.targetQuantity), producedQuantity: Number(editing.producedQuantity),
      reason: reason.trim(),
    } : {
      defectDate: dateText(editing.defectDate), shift: editing.shift || null,
      partId: Number(editing.partId), defectTypeId: Number(editing.defectTypeId),
      proses: editing.proses || null, operatorName: editing.operatorName || null,
      quantity: Number(editing.quantity), remarks: editing.remarks || null,
      reason: reason.trim(),
    };
    try {
      await api.put(`/history/${type}/${editing.id}`, data);
      toast.success('Koreksi tersimpan dengan audit log');
      setEditing(null);
      await reload();
    } catch (e) { toast.error(e.response?.data?.message || 'Koreksi gagal. Periksa validasi dan hak akses.'); }
  };
  const change = (key, value) => setEditing(v => ({ ...v, [key]: value }));
  const searched = rows.filter(r => [r.partName, r.partNumber, r.processName, r.proses, r.operatorName, r.defectName, r.machineName]
    .some(v => String(v || '').toLowerCase().includes(search.toLowerCase())));
  const field = (label, key, inputType = 'text') => (
    <label className="block text-sm font-medium space-y-1" key={key}>
      <span>{label}</span>
      <input className={boxStyle} type={inputType} value={editing[key] ?? ''}
        onChange={e => change(key, e.target.value)} />
    </label>
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <h3 className="text-lg font-bold dark:text-white">Riwayat {type === 'production' ? 'Produksi' : 'Defect'} ({searched.length})</h3>
        <input className={`${boxStyle} sm:max-w-xs`} value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari part, proses, operator..." aria-label="Cari riwayat" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[1000px] text-sm text-left dark:text-slate-100">
          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            <tr>{['Tanggal / Shift','Part / Type','Proses','Operator', type==='production'?'Target / Actual':'Jenis Defect / Qty','Status',...(isAdmin?['Aksi']:[])].map(h=><th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {searched.map(r => <tr key={r.id}>
              <td className="p-3">{dateText(type==='production'?r.productionDate:r.defectDate)}<div className="text-xs text-slate-500">Shift {r.shift||'-'}</div></td>
              <td className="p-3 font-medium">{r.partName}<div className="text-xs text-slate-500">{r.partNumber}</div></td>
              <td className="p-3">{r.processName||r.proses||'-'}</td>
              <td className="p-3">{r.operatorName||'-'}</td>
              <td className="p-3">{type==='production'?`${r.targetQuantity} / ${r.producedQuantity}`:<>{r.defectName}<div>{r.quantity} pcs</div></>}</td>
              <td className="p-3">{r.status}</td>
              {isAdmin&&<td className="p-3"><button className="text-blue-600 font-semibold hover:underline" onClick={()=>startEdit(r)}>Edit</button></td>}
            </tr>)}
            {!loading && searched.length===0 && <tr><td className="p-5 text-center" colSpan={7}>Tidak ada data untuk periode/pencarian ini.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Menampilkan maksimal 500 catatan terbaru sesuai rentang tanggal. Koreksi tersimpan dalam audit log di server.</p>
      {editing&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3">
        <div role="dialog" aria-modal="true" aria-label="Koreksi transaksi" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-5 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
          <h3 className="font-bold text-lg">Koreksi {type==='production'?'Produksi':'Defect'} #{editing.id}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {field('Tanggal',type==='production'?'productionDate':'defectDate','date')}
            {field('Shift','shift')}
            <label className="block text-sm font-medium space-y-1"><span>Part</span>
              <select className={boxStyle} value={editing.partId||''} onChange={e=>change('partId',e.target.value)}>
                {masters.parts.map(p=><option key={p.id} value={p.id}>{p.partName} ({p.partNumber})</option>)}
                {!masters.parts.some(p=>String(p.id)===String(editing.partId))&&<option value={editing.partId}>{editing.partName} ({editing.partNumber})</option>}
              </select></label>
            {type==='production' ? <>
              {field('Proses','processName')}{field('Mesin','machineName')}
              {field('Target','targetQuantity','number')}{field('Actual','producedQuantity','number')}
            </> : <>
              <label className="block text-sm font-medium space-y-1"><span>Jenis Defect</span>
                <select className={boxStyle} value={editing.defectTypeId||''} onChange={e=>change('defectTypeId',e.target.value)}>
                  {masters.defects.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select></label>
              {field('Proses','proses')}{field('Operator','operatorName')}
              {field('Jumlah NG','quantity','number')}{field('Keterangan','remarks')}
            </>}
          </div>
          <label className="block text-sm font-semibold">Alasan koreksi (wajib, min. 5 karakter)
            <textarea className={boxStyle} rows={3} value={reason} onChange={e=>setReason(e.target.value)}/>
          </label>
          <div className="flex justify-end gap-2">
            <button className="rounded-lg px-4 py-2 border dark:border-slate-600" onClick={()=>setEditing(null)}>Batal</button>
            <button className="rounded-lg px-4 py-2 bg-blue-600 text-white font-semibold" onClick={save}>Simpan Koreksi</button>
          </div>
        </div>
      </div>}
    </section>
  );
}