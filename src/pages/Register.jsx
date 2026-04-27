import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';

function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        role: 'OPERATOR'
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.username || !formData.password) {
            toast.error("Semua kolom wajib diisi!");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/register', {
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password,
                role: formData.role
            });

            toast.success("Akun berhasil dibuat! Silakan Login.");
            navigate('/login');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error("Data tidak valid atau Username sudah terdaftar!");
            } else {
                toast.error("Gagal mendaftar. Pastikan server menyala.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 via-70% to-white flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">QC MONITORING</h1>
                    <p className="text-slate-500 font-medium mt-1">Daftar Akun Baru</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">

                    {/* ---> INPUT BARU: NAMA LENGKAP <--- */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Masukkan nama lengkap"
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Buat username"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Buat password"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Hak Akses (Role)</label>
                        <select
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 cursor-pointer"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            value={formData.role}
                        >
                            <option value="OPERATOR">Operator (Hanya Input Data)</option>
                            <option value="ADMIN">Admin (Akses Laporan & Master Data)</option>
                        </select>
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 mt-2"
                    >
                        {isLoading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : null}
                        {isLoading ? 'MENDAFTAR...' : 'DAFTAR AKUN'}
                    </button>

                    <p className="text-center text-sm font-semibold text-slate-500 mt-6">
                        Sudah punya akun? <Link to="/login" className="text-blue-600 hover:underline">Log In di sini</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
export default Register;