import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { PenTool, Box, MessageSquare, Database, FileText, AlignLeft, X, User, Settings, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import LogoGambar from '../images/LogoQCMDAS.png';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const userRole = localStorage.getItem('user_role') || 'OPERATOR';
  const username = localStorage.getItem('username') || 'Pengguna';
  const isAdmin = userRole === 'ADMIN';
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    setIsProfileOpen(false);
    navigate('/login');
  };

  const navBg = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200';
  const navText = isDark ? 'text-slate-100' : 'text-slate-800';
  const navSubText = isDark ? 'text-slate-400' : 'text-slate-500';
  const menuBtnHover = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100';
  const dropdownBg = isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white border-slate-200';
  const dropdownItem = isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-blue-400' : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600';
  const dividerColor = isDark ? 'bg-slate-700' : 'bg-slate-200';
  const settingsPanel = isDark ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200';
  const settingsLabel = isDark ? 'text-slate-300' : 'text-slate-700';
  const pageBg = isDark ? 'bg-slate-900' : 'bg-slate-100';
  const sidebarBg = isDark ? 'bg-slate-900' : 'bg-slate-800';
  const sidebarOverlay = isDark ? 'bg-slate-900/50' : 'bg-slate-800/40';
  const fabBg = 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className={`min-h-screen ${pageBg} flex flex-col relative overflow-hidden transition-colors duration-300`}>
      <div className="fixed top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
        <div className="animate-spin-superslow"></div>
      </div>

      <div className={`${navBg} backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors duration-300`}>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 -ml-2 ${navSubText} ${menuBtnHover} rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label="Toggle Menu"
          >
            <AlignLeft size={24} />
          </button>
          <div>
            <h1 className={`text-xl font-black tracking-wider ${navText}`}>QC MONITORING</h1>
            <p className={`text-xs ${navSubText} font-medium select-none hidden sm:block`}>Defect Analysis System</p>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSettingsOpen(false); }}
            className={`flex items-center gap-3 ${menuBtnHover}/60 p-1.5 pr-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md uppercase">
              {username.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className={`text-sm font-bold ${navText} leading-tight capitalize`}>{username}</span>
              <span className={`text-xs ${navSubText} font-medium leading-tight`}>{userRole}</span>
            </div>
            <ChevronDown size={16} className={navSubText} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setIsProfileOpen(false); setIsSettingsOpen(false); }} />
              <div className={`absolute right-0 mt-3 w-64 ${dropdownBg} backdrop-blur-xl rounded-2xl shadow-2xl border py-2 z-50 overflow-hidden`}>
                <div className={`px-4 py-3 border-b ${dividerColor} md:hidden`}>
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'} capitalize`}>{username}</p>
                  <p className={`text-xs ${navSubText}`}>{userRole}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className={`w-full px-4 py-3 text-left text-sm font-semibold ${dropdownItem} flex items-center gap-3 transition-colors`}
                >
                  <User size={18} />
                  Profil Saya
                </Link>

                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`w-full px-4 py-3 text-left text-sm font-semibold ${dropdownItem} flex items-center gap-3 transition-colors`}
                >
                  <Settings size={18} />
                  <span className="flex-1">Pengaturan</span>
                </button>

                {isSettingsOpen && (
                  <div className={`mx-3 mb-2 rounded-xl border ${settingsPanel} p-3 space-y-3`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${settingsLabel}`}>
                          {isDark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}
                        role="switch"
                        aria-checked={isDark}
                        aria-label="Toggle dark mode"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <div className={`h-px ${dividerColor} my-1 mx-3`} />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-transparent relative z-10 p-4 pt-2 md:p-6 md:pt-4">
        <Outlet />
      </div>

      {isSidebarOpen && (
        <div
          className={`fixed inset-0 ${sidebarOverlay} backdrop-blur-sm z-40 transition-opacity`}
          onClick={closeSidebar}
        />
      )}

      {/* Off-Canvas Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 ${sidebarBg} text-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 relative border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center justify-center mt-4">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-black/40 overflow-hidden">
              <img src={LogoGambar} alt="Logo Produk" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-sm leading-tight font-black tracking-widest text-white text-center uppercase">PT GALAXY MANDIRI PERKASA</h2>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <Link to="/dashboard" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/input-defect" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/input-defect' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <PenTool size={20} />
            Input Defect
          </Link>
          <Link to="/input-production" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/input-production' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Box size={20} />
            Input Produksi
          </Link>
          <Link to="/input-complaint" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/input-complaint' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <MessageSquare size={20} />
            Customer Komplain
          </Link>

          {isAdmin && (
            <>
              <Link to="/master-data" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/master-data' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Database size={20} />
                Master Data
              </Link>
              <Link to="/reports" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <FileText size={20} />
                Reports
              </Link>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="text-xs text-slate-500 font-medium">QC Division &copy; 2026</div>
        </div>
      </div>

      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className={`fixed bottom-6 right-6 z-40 ${fabBg} text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-600/30`}
          aria-label="Open Sidebar"
        >
          <AlignLeft size={24} />
        </button>
      )}
    </div>
  );
}
export default Layout;