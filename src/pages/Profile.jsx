import React, { useState } from 'react';
import { User, Mail, Briefcase, Key, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';

function Profile() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: localStorage.getItem('username') || 'Pengguna',
        role: localStorage.getItem('user_role') || 'ADMIN',
        email: localStorage.getItem('user_email') || 'admin@gmail.com',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Password baru dan konfirmasi password tidak cocok!');
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/users/update-profile', {
                fullName: formData.username,
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem('username', formData.username);
            localStorage.setItem('user_email', formData.email);

            toast.success('Profil berhasil diperbarui!');
            setFormData({ ...formData, password: '', confirmPassword: '' });
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            console.error("Gagal update profil:", error);
            toast.error('Gagal menyimpan profil ke database server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 transition-colors duration-300 relative">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* HEADER KARTU PROFIL */}
                <div className="bg-white dark:bg-slate-800/90 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-all">
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-500/30 uppercase shrink-0 border-4 border-white dark:border-slate-800">
                        {formData.username.charAt(0)}
                    </div>
                    <div className="text-center sm:text-left flex-1 mt-2">
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight capitalize">{formData.username}</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">QC Division • PT Galaxy Mandiri Perkasa</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            {formData.role}
                        </div>
                    </div>
                </div>

                {/* FORM EDIT DATA */}
                <form onSubmit={handleSave} className="bg-white dark:bg-slate-800/90 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 transition-all">

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">Informasi Akun</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <User size={16} className="text-slate-400" /> Nama Lengkap
                            </label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white font-medium transition-all" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Briefcase size={16} className="text-slate-400" /> Hak Akses (Role)
                            </label>
                            <input type="text" value={formData.role} disabled className="w-full p-3.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-500 cursor-not-allowed font-bold" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" /> Email Perusahaan
                            </label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white font-medium transition-all" required />
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 pt-6 mt-6">Ubah Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Key size={16} className="text-slate-400" /> Password Baru
                            </label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kosongkan jika tidak ingin diubah" className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Key size={16} className="text-slate-400" /> Konfirmasi Password Baru
                            </label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Ulangi password baru" className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white transition-all" />
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 shadow-lg shadow-blue-500/30 tracking-wide">
                            {isLoading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span> : <Save size={20} />}
                            {isLoading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Profile;