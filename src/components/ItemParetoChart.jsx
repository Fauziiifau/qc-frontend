import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ReferenceLine, Bar, Line
} from 'recharts';
import api from '../api/axiosConfig';
import { buildPairPareto, buildItemDetail } from '../utils/itemPareto';

const shorten = (value, limit) => {
  const text = String(value || '-');
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
};

/**
 * Pareto kombinasi Part + Jenis Defect berdasarkan total unit NG.
 * Endpoint /dashboard/pareto-items sudah mengembalikan defects[] per item.
 */
export default function ItemParetoChart({ startDate, endDate }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get('/dashboard/pareto-items', { params: { startDate, endDate } })
      .then(response => {
        if (active) setItems(Array.isArray(response.data) ? response.data : []);
      })
      .catch(err => {
        if (active) setError(err?.response?.data?.message || 'Gagal mengambil Pareto per item.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [startDate, endDate]);

  // Satu batang untuk setiap pasangan part dan jenis defect, bukan jumlah kategorinya.
  const chartData = useMemo(() => buildPairPareto(items), [items]);
  const showAll = selectedId === 'all';
  const current = items.find(item => String(item.itemId) === String(selectedId)) || null;
  const details = useMemo(() => showAll ? chartData : buildItemDetail(current), [showAll, chartData, current]);
  const itemTotal = details.reduce((sum, item) => sum + item.quantity, 0);
  const totalNg = chartData.reduce((sum, item) => sum + item.quantity, 0);

  const getAxisRow = key => chartData[Number(key) - 1];

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-slate-800 dark:text-slate-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Analisis Pareto per Item dan Jenis Defect</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Setiap batang mewakili satu kombinasi part dan jenis defect, diurutkan dari jumlah NG terbesar.
          </p>
        </div>
        <span className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
          Jumlah NG (pcs)
        </span>
      </div>

      {loading && <p role="status" className="py-6 text-sm">Mengambil data item...</p>}
      {error && <p role="alert" className="py-4 text-sm text-rose-500">{error}</p>}
      {!loading && !error && chartData.length === 0 && <p className="py-6 text-sm">Tidak ada data defect pada periode ini.</p>}
      {!loading && !error && chartData.length > 0 && (
        <>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            {chartData.length} kombinasi part–defect · {totalNg.toLocaleString('id-ID')} pcs NG · Klik batang untuk melihat detail part.
          </p>
          <div className="overflow-x-auto pb-2" aria-label="Grafik Pareto pasangan part dan jenis defect">
            <div style={{ minWidth: Math.max(760, chartData.length * 140), height: 395 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 18, right: 26, left: 3, bottom: 98 }}
                  onClick={state => {
                    const id = state?.activePayload?.[0]?.payload?.itemId;
                    if (id != null) setSelectedId(String(id));
                  }}
                >
                  <CartesianGrid stroke="#475569" strokeDasharray="3 4" />
                  <XAxis
                    dataKey="axisKey"
                    angle={-33}
                    textAnchor="end"
                    interval={0}
                    height={125}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={key => {
                      const row = getAxisRow(key);
                      return row ? `${shorten(row.itemName, 17)} · ${shorten(row.defectName, 12)}` : '';
                    }}
                  />
                  <YAxis yAxisId="left" allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]}
                    tickFormatter={value => `${value}%`} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #475569', color: '#f8fafc', borderRadius: 10 }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 700 }}
                    labelFormatter={key => {
                      const row = getAxisRow(key);
                      return row ? `${row.itemName} (${row.partNumber || '-'}) — ${row.defectName}` : String(key);
                    }}
                    formatter={(value, name) => name === 'Kumulatif (%)'
                      ? [`${Number(value).toFixed(1)}%`, name]
                      : [`${Number(value).toLocaleString('id-ID')} pcs`, name]}
                  />
                  <Legend verticalAlign="top" />
                  <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="5 5"
                    label={{ value: '80%', position: 'right', fill: '#ef4444' }} />
                  <Bar yAxisId="left" dataKey="quantity" name="Jumlah NG (pcs)"
                    fill="#3b82f6" maxBarSize={64} cursor="pointer" />
                  <Line yAxisId="right" type="monotone" dataKey="cumulative"
                    name="Kumulatif (%)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-5">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Detail Item — Tabel Analisis Data</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {showAll
                    ? 'Semua kombinasi part dan defect, diurutkan menurut jumlah NG. Proporsi dihitung terhadap seluruh NG.'
                    : 'Proporsi dan kumulatif dihitung dari jumlah NG pada item yang dipilih.'}
                </p>
              </div>
              <label className="text-sm flex flex-col gap-1" htmlFor="pareto-item-select">
                <span className="font-semibold">Pilih Part / Item</span>
                <select
                  id="pareto-item-select"
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 max-w-full"
                  value={showAll ? 'all' : (current ? String(current.itemId) : 'all')}
                  onChange={event => setSelectedId(event.target.value)}
                >
                  <option value="all">Semua Part</option>
                  {items.map(item => (
                    <option key={item.itemId} value={String(item.itemId)}>
                      {item.itemName} ({item.partNumber})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {(showAll || current) && (
              <>
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                  {showAll ? (
                    <><strong>Semua Part</strong> · <strong>{itemTotal.toLocaleString('id-ID')} pcs NG</strong> · {details.length} kombinasi part–defect</>
                  ) : (
                    <><strong>{current.itemName}</strong> · {current.partNumber} · <strong>{itemTotal.toLocaleString('id-ID')} pcs NG</strong> · {details.length} jenis defect</>
                  )}
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/70 text-xs uppercase text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-4 py-3">Peringkat</th>
                        {showAll && <th className="px-4 py-3">Part / Item</th>}
                        <th className="px-4 py-3">Jenis Defect</th>
                        <th className="px-4 py-3 text-right">Jumlah NG</th>
                        <th className="px-4 py-3">Proporsi</th>
                        <th className="px-4 py-3 text-right">Kumulatif %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {details.map(row => (
                        <tr key={showAll ? `${row.itemId}-${row.defectName}` : row.defectName} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-semibold">{row.rank}</td>
                          {showAll && <td className="px-4 py-3 font-medium">{row.itemName} <span className="text-xs text-slate-500">({row.partNumber || '-'})</span></td>}
                          <td className="px-4 py-3 font-medium">{row.defectName}</td>
                          <td className="px-4 py-3 text-right font-bold">{row.quantity.toLocaleString('id-ID')} pcs</td>
                          <td className="px-4 py-3 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <div className="h-2 min-w-[55px] flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${row.percentage}%` }} />
                              </div>
                              <span className="w-12 text-right tabular-nums">{row.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                            {row.cumulative.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 dark:bg-slate-900/40 font-bold">
                        <td className="px-4 py-3" colSpan={showAll ? 3 : 2}>Total</td>
                        <td className="px-4 py-3 text-right">{itemTotal.toLocaleString('id-ID')} pcs</td>
                        <td className="px-4 py-3">100%</td>
                        <td className="px-4 py-3 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}