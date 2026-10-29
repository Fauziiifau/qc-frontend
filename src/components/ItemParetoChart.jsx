import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ReferenceLine, Bar, Line
} from 'recharts';
import api from '../api/axiosConfig';

/**
 * Pareto per item.
 * startDate dan endDate berbentuk YYYY-MM-DD seperti pada filter Dashboard.
 * Pilih "Total NG" (default Pareto) atau "Jumlah jenis defect".
 */
export default function ItemParetoChart({ startDate, endDate }) {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('types');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get('/dashboard/pareto-items', { params: { startDate, endDate } })
      .then(response => {
        if (!active) return;
        setItems(Array.isArray(response.data) ? response.data : []);
      })
      .catch(err => {
        if (active) setError(err?.response?.data?.message || 'Gagal mengambil Pareto per item.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [startDate, endDate]);

  const chartData = useMemo(() => {
    const metric = mode === 'types' ? 'totalDefectTypes' : 'totalQuantity';
    const ordered = [...items].sort((a, b) =>
      Number(b[metric] || 0) - Number(a[metric] || 0) ||
      (a.itemName || '').localeCompare(b.itemName || '')
    );
    const grandTotal = ordered.reduce((sum, item) => sum + Number(item[metric] || 0), 0);
    let running = 0;
    return ordered.map(item => {
      running += Number(item[metric] || 0);
      return {
        ...item,
        label: item.itemName || item.partNumber || `Item ${item.itemId}`,
        metricValue: Number(item[metric] || 0),
        cumulative: grandTotal > 0 ? Math.round(running * 10000 / grandTotal) / 100 : 0
      };
    });
  }, [items, mode]);

  const current = chartData.find(item => String(item.itemId) === String(selectedId)) || chartData[0];
  const metricLabel = mode === 'types' ? 'Jumlah jenis defect' : 'Total NG (unit)';

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-slate-800 dark:text-slate-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Analisis Pareto per Item</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Jumlah NG dan jenis defect pada setiap item</p>
        </div>
        <label className="text-sm">
          <span className="mr-2">Ukuran grafik:</span>
          <select className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
            value={mode} onChange={e => setMode(e.target.value)}>
            <option value="quantity">Total NG</option>
            <option value="types">Jumlah jenis defect</option>
          </select>
        </label>
      </div>
      {loading && <p role="status">Mengambil data item...</p>}
      {error && <p role="alert" className="text-rose-400">{error}</p>}
      {!loading && !error && chartData.length === 0 && <p>Tidak ada data defect pada periode ini.</p>}
      {!loading && !error && chartData.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <div style={{ minWidth: Math.max(680, chartData.length * 110), height: 390 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 16, right: 18, left: 2, bottom: 75 }}
                  onClick={state => {
                    const id = state?.activePayload?.[0]?.payload?.itemId;
                    if (id != null) setSelectedId(String(id));
                  }}>
                  <CartesianGrid stroke="#475569" strokeDasharray="3 4" />
                  <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} height={100}
                    tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: '#cbd5e1' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]}
                    tickFormatter={value => `${value}%`} tick={{ fill: '#cbd5e1' }} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#475569' }}
                    formatter={(value, name) => name === 'Kumulatif (%)'
                      ? [`${value}%`, name] : [value, name]} />
                  <Legend verticalAlign="top" />
                  <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "80%", position: "right", fill: "#ef4444" }} />
                  <Bar yAxisId="left" dataKey="metricValue" name={metricLabel}
                    fill="#3b82f6" maxBarSize={75} cursor="pointer" />
                  <Line yAxisId="right" type="monotone" dataKey="cumulative"
                    name="Kumulatif (%)" stroke="#f59e0b" strokeWidth={3} dot />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-5">
            <label className="mr-2 text-sm" htmlFor="pareto-item-select">Detail item:</label>
            <select id="pareto-item-select" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2"
              value={current ? String(current.itemId) : ''}
              onChange={e => setSelectedId(e.target.value)}>
              {chartData.map(item => (
                <option key={item.itemId} value={String(item.itemId)}>
                  {item.itemName} ({item.partNumber})
                </option>
              ))}
            </select>
            {current && (
              <div className="mt-4 overflow-x-auto">
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
                  <strong>{current.itemName}</strong> · {current.partNumber} ·
                  {` ${current.totalQuantity} unit NG · ${current.totalDefectTypes} jenis defect`}
                </p>
                <table className="w-full border-collapse text-left text-sm">
                  <thead><tr className="border-b border-slate-600">
                    <th className="py-2">Jenis Defect</th><th className="py-2 text-right">Jumlah NG</th>
                  </tr></thead>
                  <tbody>{(current.defects || []).map(d => (
                    <tr className="border-b border-slate-700" key={d.defectName}>
                      <td className="py-2">{d.defectName}</td>
                      <td className="py-2 text-right">{d.quantity}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}