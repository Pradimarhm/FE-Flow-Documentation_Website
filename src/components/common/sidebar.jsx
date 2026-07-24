import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PanelLeftClose, 
    PanelLeftOpen, 
    LayoutDashboard, 
    Network, 
    Braces, 
    Settings,
    LogOut,
    BookAlert,
    SquareStack,
    CheckCircle2,
    Layers2 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

// Menggunakan ErrorPopup yang sudah ada atau diadaptasi
import ErrorPopup from '../error/ErrorPopup'; 

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [popupState, setPopupState] = useState({ isOpen: false, title: '', message: '', isSuccess: false });

    const logoutStore = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Flow Canvas', icon: Network, path: '/flow' },
        { name: 'Template', icon: Layers2, path: '/template' },
        // { name: 'Nodes', icon: SquareStack, path: '/nodes' },
        // { name: 'API Endpoints', icon: Braces, path: '/api-endpoints' },
        { name: 'Execution Logs', icon: BookAlert, path: '/logs' },
    ];

    const handleLogoutClick = async () => {
        setIsLoading(true);
        try {
            // Panggil API logout sesuai endpoint POST /auth/logout
            await authService.logout();
            
            // Tampilkan popup sukses
            setPopupState({
                isOpen: true,
                title: "Berhasil",
                message: "Logged out successfully",
                isSuccess: true
            });
        } catch (err) {
            // Tetap lakukan logout lokal meskipun API gagal (misal token sudah expired)
            setPopupState({
                isOpen: true,
                title: "Informasi",
                message: err.message || "Sesi telah berakhir.",
                isSuccess: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosePopup = () => {
        setPopupState({ ...popupState, isOpen: false });
        // Bersihkan state auth di Zustand dan tendang ke login
        logoutStore();
        navigate('/login', { replace: true });
    };

    return (
        <aside 
            className={`relative flex flex-col border-r-2 border-olive-900 bg-white transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-fit' : 'w-64'
            }`}
        >
            {/* HEADER & TOGGLE BUTTON */}
            <div className={`flex items-center h-16 px-3 border-b-2 border-olive-900 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <span className="flex flex-col text-xl font-semibold tracking-tight text-olive-500 truncate">
                        FlowTech
                        <span className="text-xs font-normal tracking-tight text-black truncate">
                            help your flow and documentation
                        </span>
                    </span>
                )}
                
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-center p-2 rounded-xs text-olive-700 hover:bg-olive-100 hover:border-2 hover:border-dashed hover:border-olive-700 hover:text-olive-900 transition-colors cursor-pointer"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            {/* NAV LIST */}
            <nav className="flex-1 py-3 px-2 flex flex-col overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                        flex items-center h-14 min-w-14 px-4 py-4 transition-colors rounded-xs
                        ${isActive 
                            ? 'bg-olive-100 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1 shadow-black text-black font-medium' 
                            : 'text-olive-700 hover:border-2 hover:border-olive-700 hover:border-dashed hover:text-olive-900'
                        }
                        ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}
                        `}
                        title={isCollapsed ? item.name : undefined}
                    >
                        <item.icon size={20} className="shrink-0" />
                        
                        {!isCollapsed && (
                            <span className="text-sm font-normal truncate whitespace-nowrap">
                                {item.name}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* FOOTER NAV (Settings & Logout) */}
            <div className="p-2 border-t border-olive-300 flex flex-col gap-2">
                <button 
                    className={`flex h-14 items-center px-3 py-2 rounded-xs text-olive-700 hover:border-olive-700 hover:text-olive-900 hover:border-2 hover:border-dashed transition-colors cursor-pointer ${
                        isCollapsed ? 'justify-center' : 'justify-start gap-3'
                    }`}
                    title={isCollapsed ? "Settings" : undefined}
                >
                    <Settings size={20} className="shrink-0" />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                </button>
                
                <button 
                    onClick={handleLogoutClick}
                    disabled={isLoading}
                    className={`flex h-14 items-center px-3 py-2 rounded-xs hover:border-2 hover:border-rose-500 hover:border-dashed transition-colors cursor-pointer disabled:opacity-50 ${
                        isCollapsed 
                        ? 'justify-center text-rose-500 hover:bg-rose-50' 
                        : 'justify-start gap-3 text-rose-500 hover:bg-rose-50'
                    }`}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">{isLoading ? "Logging out..." : "Logout"}</span>}
                </button>
            </div>

            {/* POPUP NOTIFIKASI BERHASIL LOGOUT (Memanfaatkan struktur ErrorPopup gaya Neo-Brutalisme) */}
            <ErrorPopup 
                isOpen={popupState.isOpen}
                onClose={handleClosePopup}
                title={popupState.title}
                message={popupState.message}
            />
        </aside>
    );
};

export default Sidebar;