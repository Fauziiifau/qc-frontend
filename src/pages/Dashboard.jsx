import React, { useState, useEffect } from 'react';
import {
    Target, AlertTriangle, Loader2, TrendingUp, TrendingDown, Factory, Database, MessageSquare,
    BarChart3, Wand2, ListFilter, Star, Bug, CheckCircle, Info, Cpu
} from 'lucide-react';
import {
    ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
    fetchDashboardSummary,
    fetchParetoData,
    fetchDailyProduction,
    fetchComplaintSummary,
    fetchComplaintParetoData
} from '../services/dashboardService';
import api from '../api/axiosConfig';

const DailyBreakdownTable = ({ data }) => {
    return (
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daily Breakdown</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Log produksi aktual vs target berdasarkan shift kerja</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-center">Shift</th>
                            <th className="px-6 py-4 text-center">Target</th>
                            <th className="px-6 py-4 text-center">Produced</th>
                            <th className="px-6 py-4 text-center">Variance</th>
                            <th className="px-6 py-4 w-40">Efficiency</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">Data produksi belum tersedia untuk rentang tanggal ini.</td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const target = row.target || 0;
                                const produced = row.produced || 0;
                                const variance = produced - target;
                                const efficiency = target > 0 ? Math.round((produced / target) * 100) : 0;
                                const isGood = variance >= 0;
                                const shiftData = row.shift || '-';
                                const isShift1 = shiftData.toLowerCase().includes('1');
                                const isShift2 = shiftData.toLowerCase().includes('2');

                                let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
                                if (isShift1) {
                                    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
                                } else if (isShift2) {
                                    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
                                }

                                return (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.date}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                                                {shiftData}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">{target}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-800 dark:text-slate-200">{produced}</td>
                                        <td className="px-6 py-4 text-center font-bold">
                                            <div className={`flex items-center justify-center gap-1 ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {isGood ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {isGood ? `+${variance}` : variance}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${Math.min(efficiency, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`font-bold text-xs ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {efficiency}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isGood
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-rose-500 text-white'
                                                }`}>
                                                {isGood ? 'On Target' : 'Below'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('production');
    const [activeDefectTab, setActiveDefectTab] = useState('chart');
    const [activeDataset, setActiveDataset] = useState('internal');
    const [kpi, setKpi] = useState({ totalProduction: 0, totalNg: 0, defectRate: 0 });
    const [productionData, setProductionData] = useState([]);
    const [mergedPareto, setMergedPareto] = useState([]);
    const [pareto, setPareto] = useState([]);
    const [complaintPareto, setComplaintPareto] = useState([]);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const [aiInsights, setAiInsights] = useState([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [mlRekomendasi, setMlRekomendasi] = useState("");
    const [isLoadingMl, setIsLoadingMl] = useState(false);
    const [mlError, setMlError] = useState("");

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (!startDate || !endDate) {
            return;
        }
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [kpiRes, paretoRes, prodRes, compSummaryRes, compParetoRes] = await Promise.all([
                    fetchDashboardSummary(startDate, endDate).catch(() => null),
                    fetchParetoData(startDate, endDate).catch(() => []),
                    fetchDailyProduction(startDate, endDate).catch(() => []),
                    fetchComplaintSummary(startDate, endDate).catch(() => ({ totalComplaints: 0 })),
                    fetchComplaintParetoData(startDate, endDate).catch(() => [])
                ]);
                setKpi(kpiRes || { totalProduction: 0, totalNg: 0, defectRate: 0 });
                setProductionData(prodRes || []);
                setPareto(paretoRes || []);
                setComplaintPareto(compParetoRes || []);
                setTotalComplaints(compSummaryRes?.totalComplaints || 0);

                const allDefectNames = Array.from(new Set([
                    ...(paretoRes || []).map(d => d.defectName),
                    ...(compParetoRes || []).map(d => d.defectName)
                ]));

                let combined = allDefectNames.map(name => {
                    const intQty = (paretoRes || []).find(d => d.defectName === name)?.totalQuantity || 0;
                    const custQty = (compParetoRes || []).find(d => d.defectName === name)?.totalQuantity || 0;
                    return { defectName: name, totalQuantity: intQty + custQty };
                });

                combined.sort((a, b) => b.totalQuantity - a.totalQuantity);
                let running = 0;
                const grand = combined.reduce((s, i) => s + i.totalQuantity, 0);
                setMergedPareto(combined.map(i => {
                    running += i.totalQuantity;
                    return { ...i, cumulativePercentage: grand > 0 ? parseFloat(((running / grand) * 100).toFixed(1)) : 0 };
                }));

                setIsLoadingInsights(true);
                try {
                    const insightResponse = await api.get('/insights/generate', {
                        params: { startDate, endDate }
                    });
                    setAiInsights(insightResponse.data);
                } catch (error) {
                    console.error("Gagal mengambil AI Insights:", error);
                    setAiInsights([]);
                } finally {
                    setIsLoadingInsights(false);
                }

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [startDate, endDate]);

    useEffect(() => {
        if (activeDefectTab === 'insight' && mergedPareto.length > 0) {
            const fetchMlAuto = async () => {
                setIsLoadingMl(true);
                setMlRekomendasi("");
                setMlError("");

                const topDefect = mergedPareto[0].defectName;

                try {
                    const contextResponse = await api.get(`/ai/get-context?defectName=${topDefect}`);
                    const { proses } = contextResponse.data;

                    const payloadDinamis = {
                        proses: proses,
                        jenis_defect: topDefect
                    };
                    const mlResponse = await api.post('/ai/predict-action', payloadDinamis);

                    setMlRekomendasi(mlResponse.data.rekomendasi);

                } catch (error) {
                    console.error("Gagal memanggil ekosistem AI:", error);
                    setMlError(`Data riwayat perbaikan untuk defect '${topDefect}' belum cukup untuk diprediksi secara presisi oleh AI. Menunggu update dataset bulan berikutnya.`);
                } finally {
                    setIsLoadingMl(false);
                }
            };

            fetchMlAuto();
        }
    }, [activeDefectTab, mergedPareto]);

    const activeProductionDays = productionData.filter(d => d.produced !== null);
    const avgDailyProduction = activeProductionDays.length > 0
        ? Math.round(activeProductionDays.reduce((acc, curr) => acc + curr.produced, 0) / activeProductionDays.length)
        : 0;

    const currentParetoData = activeDataset === 'internal' ? pareto : complaintPareto;
    const currentTotal = activeDataset === 'internal' ? kpi.totalNg : totalComplaints;
    const currentLabel = activeDataset === 'internal' ? 'Cacat Internal' : 'Komplain';
    const grandTotalIssues = mergedPareto.reduce((sum, item) => sum + item.totalQuantity, 0);
    const grandTotalQuantity = currentParetoData.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
    let runningTotalQty = 0;

    let top80Count = 0;
    let top80Percent = 0;
    if (mergedPareto.length > 0) {
        const idx = mergedPareto.findIndex(item => item.cumulativePercentage >= 80);
        top80Count = idx !== -1 ? idx + 1 : mergedPareto.length;
        top80Percent = idx !== -1 ? mergedPareto[idx].cumulativePercentage : 100;
    }
    const dataGrafik = productionData.map(item => ({
        ...item,
        labelUnik: item.shift ? `${item.date} (${item.shift})` : item.date
    }));

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 gap-4 backdrop-blur-sm transition-colors">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            {activeTab === 'production' ? 'Data Produksi' : 'Analisis Pareto'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Monitoring performa aktual vs target secara real-time
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto transition-colors">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Dari</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-sm font-bold text-slate-800 dark:text-slate-200 outline-none bg-transparent cursor-pointer dark:[color-scheme:dark]"
                                />
                            </div>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Sampai</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-sm font-bold text-slate-800 dark:text-slate-200 outline-none bg-transparent cursor-pointer dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <select
                            className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer w-full sm:w-auto min-w-[180px] transition-colors"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                        >
                            <option value="production">Data Produksi</option>
                            <option value="defect">Grafik Pareto (Cacat)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 skeleton" />)
                    ) : (
                        <>
                            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:-translate-y-1 transition-all backdrop-blur-sm shimmer-card">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                    <Factory size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Produksi</span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{kpi.totalProduction.toLocaleString()}</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">unit tercatat</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:-translate-y-1 transition-all backdrop-blur-sm shimmer-card">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rata-rata Harian</span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{avgDailyProduction}</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">unit / hari kerja</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:-translate-y-1 transition-all backdrop-blur-sm shimmer-card">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                                    <Bug size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Internal Defect (NG)</span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{kpi.totalNg}</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">Tingkat cacat: {kpi.defectRate}%</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start gap-4 hover:-translate-y-1 transition-all backdrop-blur-sm shimmer-card">
                                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Customer Complaint</span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{totalComplaints}</span>
                                    <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold mt-0.5">Laporan retur pelanggan</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {activeTab === 'production' ? (
                    <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Produksi per Hari</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Output aktual vs target harian</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataGrafik} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                                    <XAxis dataKey="labelUnik" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#0f172a' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="produced" name="Aktual" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={16} />
                                    <Bar dataKey="target" name="Target" fill="#94a3b8" opacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <DailyBreakdownTable data={productionData} />

                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* DATASET SELECTOR */}
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-6 overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <Database size={20} className="text-slate-600 dark:text-slate-400" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Dataset</h3>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">— pilih dataset untuk dianalisis di tab Data & Wawasan</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                                <div
                                    onClick={() => setActiveDataset('internal')}
                                    className={`min-w-[280px] p-4 rounded-xl border-2 flex flex-col relative cursor-pointer transition-all ${activeDataset === 'internal' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50'}`}
                                >
                                    {activeDataset === 'internal' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></div>}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activeDataset === 'internal' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                            <Bug size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${activeDataset === 'internal' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>Jenis Cacat</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cacat manufaktur internal</p>
                                            <p className={`text-xs font-bold mt-2 ${activeDataset === 'internal' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500'}`}>{kpi.totalNg} cacat tercatat</p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setActiveDataset('customer')}
                                    className={`min-w-[280px] p-4 rounded-xl border-2 flex flex-col relative cursor-pointer transition-all ${activeDataset === 'customer' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-300 dark:hover:border-rose-500/50'}`}
                                >
                                    {activeDataset === 'customer' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500"></div>}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activeDataset === 'customer' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${activeDataset === 'customer' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>Komplain Customer</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Masalah umpan balik pelanggan</p>
                                            <p className={`text-xs font-bold mt-2 ${activeDataset === 'customer' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-500'}`}>{totalComplaints} laporan tercatat</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DEFECT TYPES ANALYSIS WRAPPER */}
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                            Analisis {activeDefectTab === 'chart' ? 'Gabungan Total' : currentLabel}
                                        </h3>
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${activeDefectTab === 'chart' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : (activeDataset === 'internal' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400')}`}>
                                            {activeDefectTab === 'chart' ? `${grandTotalIssues} Pcs Defect` : `${currentTotal} ${currentLabel}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {activeDefectTab === 'chart' ? 'Grafik Gabungan Jenis Cacat dan Komplain Customer' : `Rincian lengkap untuk dataset ${currentLabel}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <button onClick={() => setActiveDefectTab('chart')} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeDefectTab === 'chart' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                        <BarChart3 size={16} /> Grafik
                                    </button>
                                    <button onClick={() => setActiveDefectTab('data')} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeDefectTab === 'data' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                        <ListFilter size={16} /> Data
                                    </button>
                                    <button onClick={() => setActiveDefectTab('insight')} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeDefectTab === 'insight' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                        <Wand2 size={16} /> Insight & AI ML
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 md:p-6">
                                {activeDefectTab === 'chart' && (
                                    <div>
                                        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Grafik Pareto</h4>
                                            </div>
                                            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-100 dark:border-rose-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wide">Aturan 80/20 Aktif</span>
                                            </div>
                                        </div>

                                        {mergedPareto.length === 0 ? (
                                            <div className="h-[400px] w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500">
                                                <BarChart3 size={32} className="mb-2 opacity-50" />
                                                <p className="text-sm font-medium">Belum ada data cacat atau komplain.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-[400px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <ComposedChart data={mergedPareto} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                                                            <XAxis dataKey="defectName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(tick) => `${tick}%`} />

                                                            <Tooltip
                                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#0f172a' }}
                                                                formatter={(value, name) => [name === 'Persentase Kumulatif' ? `${value}%` : value, name]}
                                                            />

                                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                            <ReferenceLine y={80} yAxisId="right" stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideBottomRight', value: '80%', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />

                                                            <Bar yAxisId="left" dataKey="totalQuantity" name="Total Jumlah Defect (Gabungan)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                                            <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" name="Persentase Kumulatif" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                                                        </ComposedChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center mb-6">
                                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                                                            Total Keseluruhan Cacat: <span className="text-indigo-600 dark:text-indigo-400 ml-1">{grandTotalIssues} Pcs / Unit</span>
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/50 rounded-2xl p-5 flex items-start gap-4">
                                                            <div className="mt-0.5 text-amber-500 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-500/20 p-1.5 rounded-lg">
                                                                <AlertTriangle size={20} />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-amber-900 dark:text-amber-300 mb-1.5">Indikator Aturan 80/20</h5>
                                                                <p className="text-sm text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                                                                    <strong className="text-amber-700 dark:text-amber-200">{top80Count} jenis cacat teratas</strong> menyumbang sekitar <strong className="text-amber-700 dark:text-amber-200">{top80Percent}%</strong> dari seluruh masalah produksi dan komplain. Fokus perbaikan pada area ini akan memberikan dampak penyelesaian (ROI) tertinggi bagi perusahaan.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/50 rounded-2xl p-5 flex items-start gap-4">
                                                            <div className="mt-0.5 text-blue-500 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-500/20 p-1.5 rounded-lg">
                                                                <Info size={20} />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-1.5">Tentang Prinsip Pareto</h5>
                                                                <p className="text-sm text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
                                                                    Prinsip Pareto menyatakan bahwa ~80% masalah disebabkan oleh 20% penyebab utama. Garis kumulatif (warna kuning pada grafik) yang melewati garis batas 80% menandai kategori prioritas <i>"vital few"</i> yang harus segera ditangani.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* DATASET */}
                                {activeDefectTab === 'data' && (
                                    <div>
                                        <div className="mb-6 flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Tabel Analisis Data</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Breakdown data untuk {currentLabel} yang diurutkan berdasarkan frekuensi</p>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700 text-xs tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4">PERINGKAT</th>
                                                        <th className="px-6 py-4">KATEGORI MASALAH</th>
                                                        <th className="px-6 py-4">NAMA PART</th>
                                                        <th className="px-6 py-4">JUMLAH</th>
                                                        <th className="px-6 py-4 w-48">PROPORSI</th>
                                                        <th className="px-6 py-4">KUMULATIF %</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                    {currentParetoData.map((item, idx) => {
                                                        const rank = idx + 1;
                                                        runningTotalQty += (item.totalQuantity || 0);

                                                        const sharePercent = grandTotalQuantity > 0 ? ((item.totalQuantity / grandTotalQuantity) * 100).toFixed(1) : 0;
                                                        const cumPercent = grandTotalQuantity > 0 ? ((runningTotalQty / grandTotalQuantity) * 100).toFixed(1) : 0;

                                                        const barColor = activeDataset === 'internal' ? 'bg-blue-500' : 'bg-rose-500';

                                                        return (
                                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">{rank}</div>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.defectName}</td>
                                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{item.partName || '-'}</td>
                                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold">{item.totalQuantity}</td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3 w-full">
                                                                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${sharePercent}%` }}></div>
                                                                        </div>
                                                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10">{sharePercent}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400">{item.cumulativePercentage || cumPercent}%</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {currentParetoData.length === 0 && (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">Data untuk dataset ini belum tersedia.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* AI INSIGHTS & ML ENGINE (UNIFIED REPORT) */}
                                {activeDefectTab === 'insight' && (
                                    <div className="py-4">
                                        {isLoadingInsights ? (
                                            <div className="flex items-center justify-center py-10 gap-3 text-slate-500">
                                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                                                <p className="text-sm font-medium">AI sedang memproses data pabrik...</p>
                                            </div>
                                        ) : (
                                            <div className="max-w-3xl border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                                                <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-100 dark:border-slate-700">
                                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                        <Cpu className="text-indigo-500" size={20} />
                                                        Rekomendasi Perbaikan Oleh AI
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        Integrasi deteksi anomali menggunakan Rule-Based dan rekomendasi perbaikan menggunakan Machine Learning.
                                                    </p>
                                                </div>

                                                <div className="p-5 md:p-6 space-y-4">
                                                    {aiInsights.length > 0 && (
                                                        <div className="space-y-3">
                                                            {aiInsights.map((insight, index) => {
                                                                let titleColor = "text-blue-600 dark:text-blue-400";
                                                                let borderColor = "border-blue-100 dark:border-blue-800/50";
                                                                let bgColor = "bg-blue-50/50 dark:bg-blue-900/10";
                                                                let Icon = Info;

                                                                if (insight.severity === 'CRITICAL') {
                                                                    titleColor = "text-rose-600 dark:text-rose-400";
                                                                    borderColor = "border-rose-100 dark:border-rose-800/50";
                                                                    bgColor = "bg-rose-50/50 dark:bg-rose-900/10";
                                                                    Icon = AlertTriangle;
                                                                } else if (insight.severity === 'WARNING') {
                                                                    titleColor = "text-amber-600 dark:text-amber-400";
                                                                    borderColor = "border-amber-100 dark:border-amber-800/50";
                                                                    bgColor = "bg-amber-50/50 dark:bg-amber-900/10";
                                                                    Icon = AlertTriangle;
                                                                } else if (insight.severity === 'SUCCESS') {
                                                                    titleColor = "text-emerald-600 dark:text-emerald-400";
                                                                    borderColor = "border-emerald-100 dark:border-emerald-800/50";
                                                                    bgColor = "bg-emerald-50/50 dark:bg-emerald-900/10";
                                                                    Icon = CheckCircle;
                                                                }

                                                                return (
                                                                    <div key={index} className={`p-4 rounded-xl border ${borderColor} ${bgColor}`}>
                                                                        <h5 className={`text-sm font-bold ${titleColor} mb-1.5 flex items-center gap-2`}>
                                                                            <Icon size={16} /> {insight.title}
                                                                        </h5>
                                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed ml-6">
                                                                            {insight.message}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {mergedPareto.length > 0 && (
                                                        <div className="pt-2">
                                                            <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/20 relative overflow-hidden">
                                                                <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                                                                    <Wand2 size={120} className="text-indigo-900 transform translate-x-4 -translate-y-4" />
                                                                </div>

                                                                <h5 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2 relative z-10">
                                                                    <Wand2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                                    Tindakan Korektif Prioritas: {mergedPareto[0].defectName}
                                                                </h5>

                                                                <div className="relative z-10 text-sm text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed ml-6">
                                                                    {isLoadingMl ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                                                                            <span>Model Machine Learning sedang menganalisis pola historis...</span>
                                                                        </div>
                                                                    ) : mlError ? (
                                                                        <span className="text-amber-600 dark:text-amber-400 font-medium">{mlError}</span>
                                                                    ) : mlRekomendasi ? (
                                                                        <>
                                                                            <span className="block mb-3">Berdasarkan prediksi algoritma <strong>Machine Learning,</strong> rekomendasi tindakan perbaikan untuk tim Quality Control adalah:</span>
                                                                            <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-lg border border-indigo-100 dark:border-indigo-800/50 font-bold text-indigo-900 dark:text-indigo-100 text-base shadow-sm">
                                                                                "{mlRekomendasi}"
                                                                            </div>
                                                                        </>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Dashboard;