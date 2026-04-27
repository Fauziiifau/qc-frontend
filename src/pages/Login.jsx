import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error("Username dan Password tidak boleh kosong!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            const token = response.data.token || response.data.accessToken;

            if (token) {
                localStorage.setItem('jwt_token', token);
                const userRole = response.data.role || 'ADMIN';
                localStorage.setItem('user_role', userRole);
                const displayName = response.data.fullName || response.data.username || username;
                localStorage.setItem('username', displayName);

                toast.success("Login Berhasil! Selamat datang.");
                navigate('/dashboard');
            } else {
                toast.error("Format token dari server tidak dikenali.");
            }
        } catch (error) {
            console.error("Login error:", error);
            if (error.response && error.response.status === 401) {
                toast.error("Login Gagal! Username atau Password salah.");
            } else {
                toast.error("Gagal terhubung ke server backend.");
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
                    <p className="text-slate-500 font-medium mt-1">Defect Analysis System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                            placeholder="Input username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-extrabold py-4 rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20 mt-4"
                    >
                        {isLoading ? (
                            <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span>
                        ) : null}
                        {isLoading ? 'VERIFYING...' : 'LOG IN'}
                    </button>

                    <p className="text-center text-sm font-semibold text-slate-500 mt-6 pt-6 border-t border-slate-100">
                        Belum punya akun? <Link to="/register" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">Daftar di sini</Link>
                    </p>
                </form>

            </div>
        </div>
    );
}
export default Login;