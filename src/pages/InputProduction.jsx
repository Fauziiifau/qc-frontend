import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
// ---> 1. KITA IMPORT ICON YANG HILANG <---
import { Search, Save, CheckCircle } from 'lucide-react';
import { saveBatchProduction } from '../services/productionService';
import { getAllParts, getMasterMachines } from '../services/masterDataService';

const getTodayDate = () => new Date().toISOString().split('T')[0];

function InputProduction() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMaster, setIsFetchingMaster] = useState(true);

    const [allMasterParts, setAllMasterParts] = useState([]);
    const [allMasterMachines, setAllMasterMachines] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // ---> 2. STATE UNTUK MODAL KONFIRMASI <---
    const [confirmModal, setConfirmModal] = useState(false);

    const [header, setHeader] = useState({
        productionDate: getTodayDate(),
        shift: 'Shift 1',
        line: 'Stamping'
    });

    const [gridData, setGridData] = useState([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            setIsFetchingMaster(true);
            try {
                const [parts, machines] = await Promise.all([
                    getAllParts(), getMasterMachines()
                ]);
                setAllMasterParts(parts || []);
                setAllMasterMachines(machines || []);
                initializeGrid('Stamping', machines || []);
            } catch (error) {
                toast.error("Gagal memuat master data.");
            } finally {
                setIsFetchingMaster(false);
            }
        };
        fetchMasterData();
    }, []);

    const initializeGrid = (line, machinesList) => {
        const filteredMachines = machinesList.filter(m => m.line === line);
        const initialGrid = filteredMachines.map(machine => ({
            machineName: machine.name,
            partId: '',
            partSearchQuery: '',
            showDropdown: false,
            processName: '',
            targetQuantity: '',
            producedQuantity: ''
        }));
        setGridData(initialGrid);
    };

    const handleLineChange = (newLine) => {
        setHeader({ ...header, line: newLine });
        initializeGrid(newLine, allMasterMachines);
    };

    const handleGridChange = (index, field, value) => {
        const newData = [...gridData];
        newData[index][field] = value;
        setGridData(newData);
    };

    // ---> 3. FUNGSI VALIDASI DAN BUKA MODAL <---
    const handlePreSubmit = () => {
        const validItems = gridData.filter(item => {
            const hasPart = item.partId !== '';
            const hasTarget = item.targetQuantity !== '' && parseInt(item.targetQuantity) > 0;
            const hasActual = item.producedQuantity !== '' && parseInt(item.producedQuantity) >= 0;
            const isWeldingMachine = item.machineName.toLowerCase().includes('welding');
            const needsProcess = header.line === 'Stamping' && !isWeldingMachine;
            const hasProcess = needsProcess ? item.processName !== '' : true;

            return hasPart && hasTarget && hasActual && hasProcess;
        });

        if (validItems.length === 0) {
            toast.error("Minimal isi 1 baris data (Pilih Part dari pencarian, Target, dan Aktual)!");
            return;
        }

        setConfirmModal(true); // Buka modal jika validasi lolos
    };

    // ---> 4. FUNGSI SIMPAN KE SERVER <---
    const submitData = async () => {
        setConfirmModal(false); // Tutup modal
        setIsLoading(true);

        const validItems = gridData.filter(item => {
            const hasPart = item.partId !== '';
            const hasTarget = item.targetQuantity !== '' && parseInt(item.targetQuantity) > 0;
            const hasActual = item.producedQuantity !== '' && parseInt(item.producedQuantity) >= 0;
            const isWeldingMachine = item.machineName.toLowerCase().includes('welding');
            const needsProcess = header.line === 'Stamping' && !isWeldingMachine;
            const hasProcess = needsProcess ? item.processName !== '' : true;
            return hasPart && hasTarget && hasActual && hasProcess;
        });

        try {
            const payload = {
                productionDate: header.productionDate,
                shift: header.shift,
                line: header.line,
                items: validItems.map(item => ({
                    machineName: item.machineName,
                    partId: parseInt(item.partId),
                    processName: item.processName,
                    targetQuantity: parseInt(item.targetQuantity),
                    producedQuantity: parseInt(item.producedQuantity)
                }))
            };

            await saveBatchProduction(payload);
            toast.success(`Data produksi ${validItems.length} mesin berhasil disimpan!`);
            initializeGrid(header.line, allMasterMachines);
        } catch (error) {
            toast.error("Gagal menyimpan ke database.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredGrid = gridData.filter(row =>
        row.machineName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isFetchingMaster) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-slate-500">
                Memuat Master Data...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 transition-colors duration-300 relative">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Input Produksi Harian</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Catat hasil produksi aktual berdasarkan target plan.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Cari mesin..." className="pl-10 pr-4 py-2.5 w-full md:w-64 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-6">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"> TANGGAL</label>
                            <input type="date" className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 dark:text-white cursor-pointer" value={header.productionDate} onChange={(e) => setHeader({ ...header, productionDate: e.target.value })} />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"> SHIFT</label>
                            <select className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 dark:text-white cursor-pointer" value={header.shift} onChange={(e) => setHeader({ ...header, shift: e.target.value })}>
                                <option>Shift 1</option>
                                <option>Shift 2</option>
                                <option>Shift 3</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"> PRODUCTION LINE</label>
                            <select className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 dark:text-white cursor-pointer" value={header.line} onChange={(e) => handleLineChange(e.target.value)}>
                                <option value="Stamping">Stamping</option>
                                <option value="Welding Manual">Welding Manual</option>
                                <option value="Welding Robot">Welding Robot</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-1/6">MESIN</th>
                                    <th className="px-6 py-4 w-2/6">PART NUMBER & NAME</th>
                                    <th className="px-6 py-4 w-1/6 text-center">PROSES</th>
                                    <th className="px-4 py-4 text-center w-1/12">PLAN</th>
                                    <th className="px-4 py-4 text-center w-1/12">ACTUAL</th>
                                    <th className="px-6 py-4 text-center w-1/12">OK?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredGrid.map((row) => {
                                    const realIndex = gridData.findIndex(item => item.machineName === row.machineName);
                                    const isWeldingMachine = row.machineName.toLowerCase().includes('welding');
                                    const needsProcess = header.line === 'Stamping' && !isWeldingMachine;
                                    const isFilled = row.partId !== '' && row.targetQuantity > 0 && row.producedQuantity !== '';

                                    return (
                                        <tr key={row.machineName} className={`transition-colors ${isFilled ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{row.machineName}</td>

                                            <td className="px-6 py-4 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Nama Part / Nomor Part"
                                                    className={`w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white ${row.partId === '' && row.partSearchQuery ? 'border-rose-300 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-700' : 'border-slate-200 dark:border-slate-600'}`}
                                                    value={row.partSearchQuery}
                                                    onChange={(e) => {
                                                        handleGridChange(realIndex, 'partSearchQuery', e.target.value);
                                                        handleGridChange(realIndex, 'showDropdown', true);
                                                        handleGridChange(realIndex, 'partId', '');
                                                    }}
                                                    onFocus={() => handleGridChange(realIndex, 'showDropdown', true)}
                                                    onBlur={() => setTimeout(() => handleGridChange(realIndex, 'showDropdown', false), 200)}
                                                />
                                                {row.showDropdown && (
                                                    <ul className="absolute z-50 w-[300px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-xl max-h-56 overflow-auto rounded-xl mt-1 divide-y divide-slate-50 dark:divide-slate-700 left-6">
                                                        {allMasterParts.filter(p =>
                                                            p.partNumber.toLowerCase().includes((row.partSearchQuery || '').toLowerCase()) ||
                                                            p.partName.toLowerCase().includes((row.partSearchQuery || '').toLowerCase())
                                                        ).length > 0 ? (
                                                            allMasterParts.filter(p =>
                                                                p.partNumber.toLowerCase().includes((row.partSearchQuery || '').toLowerCase()) ||
                                                                p.partName.toLowerCase().includes((row.partSearchQuery || '').toLowerCase())
                                                            ).map(p => (
                                                                <li
                                                                    key={p.id}
                                                                    onClick={() => {
                                                                        handleGridChange(realIndex, 'partId', p.id);
                                                                        handleGridChange(realIndex, 'partSearchQuery', `${p.partNumber} - ${p.partName}`);
                                                                        handleGridChange(realIndex, 'showDropdown', false);
                                                                    }}
                                                                    className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors text-left"
                                                                >
                                                                    <div className="font-bold text-slate-700 dark:text-white">{p.partNumber}</div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{p.partName}</div>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="p-3 text-center text-slate-500 dark:text-slate-400 text-sm">Tidak ditemukan</li>
                                                        )}
                                                    </ul>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <select className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white disabled:opacity-40 disabled:bg-slate-100 dark:disabled:bg-slate-900" value={row.processName} onChange={(e) => handleGridChange(realIndex, 'processName', e.target.value)} disabled={!needsProcess}>
                                                    <option value="">- Proses -</option>
                                                    {needsProcess && (
                                                        <>
                                                            <option value="Blank">Blank</option>
                                                            <option value="Bending">Bending</option>
                                                            <option value="Piercing">Piercing</option>
                                                            <option value="Restrik">Restrik</option>
                                                            <option value="Marking">Marking</option>
                                                            <option value="Notching">Notching</option>
                                                            <option value="Cutting">Cutting</option>
                                                        </>
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <input type="number" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-center text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" value={row.targetQuantity} onChange={(e) => handleGridChange(realIndex, 'targetQuantity', e.target.value)} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input type="number" className="w-full p-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-center text-blue-700 dark:text-blue-400 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" value={row.producedQuantity} onChange={(e) => handleGridChange(realIndex, 'producedQuantity', e.target.value)} />
                                            </td>
                                            <td className="px-6 py-4 flex justify-center items-center h-[72px]">
                                                {isFilled ? <CheckCircle size={24} className="text-emerald-500" /> : null}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={() => initializeGrid(header.line, allMasterMachines)} className="px-6 py-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Reset Form</button>
                        <button onClick={handlePreSubmit} disabled={isLoading} className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50">
                            {isLoading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : <Save size={18} />}
                            {isLoading ? 'Menyimpan...' : 'Simpan Batch Produksi'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ---> 5. MODAL KONFIRMASI (TEKS SAJA) <--- */}
            {confirmModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Konfirmasi Simpan</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Apakah Anda yakin data <strong className="text-slate-700 dark:text-slate-200">Produksi Harian</strong> ini sudah benar dan siap untuk disimpan ke sistem?
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

export default InputProduction;