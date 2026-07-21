import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/sidebar';
import Header from '../common/header';

const AppLayout = () => {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-black">
            {/* Sidebar Global */}
            <Sidebar />

            {/* Area Utama Kanan */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Global */}
                <Header />

                {/* 
                Wadah Konten Utama (Outlet)
                Di sinilah halaman seperti Dashboard, Database, atau FlowCanvas akan dirender.
                Kelas relative dan h-full memastikan halaman di dalamnya bisa menggunakan absolute positioning.
                */}
                <main className="flex-1 relative overflow-hidden bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;