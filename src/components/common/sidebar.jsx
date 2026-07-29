import React, { useState } from "react";
import {
    PanelLeftClose,
    PanelLeftOpen,
    LayoutDashboard,
    Network,
    SquareStack,
    Link2,
    Boxes,
    Shield,
    Users,
    Settings,
    LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import ErrorPopup from "../error/errorPopUp";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [popupState, setPopupState] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    const logoutStore = useAuthStore((state) => state.logout);
    const permissions = useAuthStore((state) => state.permissions);
    const navigate = useNavigate();

    const navItems = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            path: "/",
            moduleSlug: "dashboard",
        },
        {
            name: "Flows & Canvas",
            icon: Network,
            path: "/flows",
            moduleSlug: "flows",
        },
        {
            name: "Templates",
            icon: Boxes,
            path: "/templates",
            moduleSlug: "templates",
        },
        {
            name: "Permissions",
            icon: Shield,
            path: "/permissions",
            moduleSlug: "permissions",
        },
        { name: "Users", icon: Users, path: "/users", moduleSlug: "users" },
    ];

    const user = useAuthStore((state) => state.user);

    const authorizedNavItems = navItems.filter((item) => {
        if (item.moduleSlug === "dashboard") return true;

        if (["permissions", "users"].includes(item.moduleSlug)) {
            return user?.role_id === 1 || user?.role?.name === "Admin";
        }

        const moduleAccess = permissions.find(
            (p) => p.module === item.moduleSlug,
        );
        return moduleAccess?.actions?.includes("read");
    });

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.error("Gagal logout di backend", e);
        } finally {
            setPopupState({
                isOpen: true,
                title: "Berhasil",
                message: "Logged out successfully",
            });
        }
    };

    const handleClosePopup = () => {
        setPopupState({ ...popupState, isOpen: false });
        logoutStore();
        navigate("/auth", { replace: true });
    };

    return (
        <aside
            className={`relative flex flex-col border-r-2 border-olive-900 bg-white transition-all duration-300 ease-in-out ${
                isCollapsed ? "w-fit" : "w-64"
            }`}
        >
            <div
                className={`flex items-center h-16 px-3 border-b-2 border-olive-900 ${
                    isCollapsed ? "justify-center" : "justify-between"
                }`}
            >
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
                    className="flex items-center justify-center p-2 rounded-xs text-olive-700 hover:bg-olive-100 transition-colors cursor-pointer"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeftOpen size={20} />
                    ) : (
                        <PanelLeftClose size={20} />
                    )}
                </button>
            </div>

            {/* NAV LIST */}
            <nav className="flex-1 py-3 px-2 flex flex-col overflow-y-auto gap-1">
                {authorizedNavItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                        flex items-center h-12 min-w-12 px-3 transition-colors rounded-xs
                        ${
                            isActive
                                ? "bg-olive-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-medium"
                                : "text-olive-700 hover:border-2 hover:border-olive-700 hover:border-dashed hover:text-olive-900"
                        }
                        ${isCollapsed ? "justify-center" : "justify-start gap-3"}
                        `}
                        title={isCollapsed ? item.name : undefined}
                    >
                        <item.icon size={20} className="shrink-0" />
                        {!isCollapsed && (
                            <span className="text-sm font-normal truncate whitespace-nowrap capitalize">
                                {item.name}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* BOTTOM SECTION: SETTINGS & LOGOUT */}
            <div className="p-2 border-t border-olive-300 flex flex-col gap-1">
                {/* TOMBOL PENGATURAN / CHANGE PASSWORD */}
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                    flex h-12 items-center px-3 py-2 rounded-xs transition-colors cursor-pointer
                    ${
                        isActive
                            ? "bg-amber-100 border-2 border-black font-bold text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                            : "text-olive-800 hover:bg-olive-100 hover:border-2 hover:border-olive-800 hover:border-dashed"
                    }
                    ${isCollapsed ? "justify-center" : "justify-start gap-3"}
                    `}
                    title={isCollapsed ? "Pengaturan" : undefined}
                >
                    <Settings size={20} className="shrink-0" />
                    {!isCollapsed && (
                        <span className="text-sm font-medium">Pengaturan</span>
                    )}
                </NavLink>

                {/* TOMBOL LOGOUT */}
                <button
                    onClick={handleLogout}
                    className={`flex h-12 items-center px-3 py-2 rounded-xs hover:border-2 hover:border-rose-500 hover:border-dashed transition-colors cursor-pointer ${
                        isCollapsed
                            ? "justify-center text-rose-500 hover:bg-rose-50"
                            : "justify-start gap-3 text-rose-500 hover:bg-rose-50"
                    }`}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && (
                        <span className="text-sm font-medium">Logout</span>
                    )}
                </button>
            </div>

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
