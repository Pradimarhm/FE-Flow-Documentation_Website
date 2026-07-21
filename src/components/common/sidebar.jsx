import React, { useState } from 'react';
import { 
    PanelLeftClose , 
    PanelLeftOpen , 
    LayoutDashboard, 
    Network, 
    Braces, 
    Settings,
    LogOut,
    BookAlert
} from 'lucide-react';
import { NavLink } from 'react-router-dom'; // Asumsi kamu menggunakan React Router

const Sidebar = () => {
    // State untuk mengontrol sidebar (bisa dipindah ke Zustand nanti jika ingin persisten)
    const [isCollapsed, setIsCollapsed] = useState(true); // Default tertutup sesuai prinsip canvas-first

    // Data navigasi
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' }, // Rute utama
        { name: 'Flow Canvas', icon: Network, path: '/canvas' },
        { name: 'API Endpoints', icon: Braces, path: '/api-endpoints' },
        { name: 'Execution Logs', icon: BookAlert, path: '/logs' },
    ];

    return (
        <aside 
            className={`relative flex flex-col border-r border- border-slate-500 bg-white transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-fit' : 'w-64'
            }`}
        >
            {/* HEADER & TOGGLE BUTTON */}
            <div className={`flex items-center h-16 px-3 border-b border-slate-500 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {/* Logo/Title hanya muncul saat expanded */}
                {!isCollapsed && (
                    <span className="flex flex-col text-xl font-semibold tracking-tight text-olive-500 truncate">
                        FlowTech
                        <span className="text-xs font-normal tracking-tight text-black truncate">
                            help your flow and documentation
                        </span>
                    </span>
                )}
                
                {/* Toggle Button - Posisi dinamis berdasarkan state */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-center p-2 text-slate-500 hover:bg-gray-100 hover:border-2 hover:border-dashed hover:border-gray-500 hover:text-black transition-colors cursor-pointer"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen   size={20} /> : <PanelLeftClose  size={20} />}
                </button>
            </div>

            {/* NAV LIST */}
            <nav className="flex-1 py-3 px-2 flex flex-col overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                        flex items-center h-14 min-w-14 px-4 py-4 transition-colors
                        ${isActive 
                            ? 'bg-olive-100 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1 shadow-black text-black font-medium' // State aktif sesuai desain monokrom
                            : 'text-olive-500 hover:border-2 hover:border-olive-500 hover:border-dashed hover:text-olive-900'
                        }
                        ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}
                        `}
                        title={isCollapsed ? item.name : undefined} // Tooltip bawaan saat mode ikon
                    >
                        <item.icon size={20} className="shrink-0" />
                        
                        {/* Label hanya muncul saat expanded */}
                        {!isCollapsed && (
                            <span className="text-sm font-normal truncate whitespace-nowrap">
                                {item.name}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* FOOTER NAV (Settings & Logout) */}
            <div className="p-2 border-t border-slate-200 flex flex-col gap-2">
                <button 
                    className={`flex h-14 items-center px-3 py-2 text-olive-500 hover:border-olive-500 hover:text-olive-900 hover:border-2 hover:border-dashed transition-colors cursor-pointer ${
                        isCollapsed ? 'justify-center' : 'justify-start gap-3'
                    }`}
                    title={isCollapsed ? "Settings" : undefined}
                >
                    <Settings size={20} className="shrink-0" />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                </button>
                
                <button 
                    className={`flex h-14 items-center px-3 py-2 hover:border-2 hover:border-rose-500 hover:border-dashed transition-colors cursor-pointer ${
                        isCollapsed 
                        ? 'justify-center text-rose-500 hover:bg-rose-50' 
                        : 'justify-start gap-3 text-rose-500 hover:bg-rose-50' // Menggunakan warna semantik destruktif
                    }`}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;