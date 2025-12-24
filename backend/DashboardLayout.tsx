import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import {
    LayoutDashboard,
    Users,
    Shield,
    Newspaper,
    LogOut,
    Search,
    Bell,
    User,
    Menu
} from 'lucide-react';
import { getAssetPath } from '../utils';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/backend');
    };

    const navItems = [
        { path: '/backend/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/backend/squadre', label: 'Gestione Squadre', icon: <Shield size={20} /> },
        { path: '/backend/atleti', label: 'Anagrafica Atleti', icon: <Users size={20} /> },
        { path: '/backend/sponsor', label: 'Sponsor & Partner', icon: <Users size={20} /> }, // Using generic icon for now
        { path: '/backend/news', label: 'Area News', icon: <Newspaper size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
                    <img
                        src={getAssetPath('/images/logo-libertas.jpg')}
                        alt="Logo"
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="font-bold font-display tracking-wider">SPORT MANAGE</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Esci</span>
                    </button>
                    <div className="mt-4 px-4 text-xs text-slate-600">
                        &copy; 2025 Libertas Borgo
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center text-slate-400 bg-gray-50 rounded-full px-4 py-2 w-96 border border-gray-200">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Cerca..."
                            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-slate-700 placeholder-slate-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="text-slate-400 hover:text-slate-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <User size={18} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
