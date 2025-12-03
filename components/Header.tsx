import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="text-2xl font-black text-blue-900 tracking-tighter">
                    <img src="/logo-libertas.jpg" alt="Libertas Borgo Volley" className="h-12 w-auto" />
                </div>
                <nav className="hidden md:block">
                    <ul className="flex space-x-8 font-medium">
                        <li><a href="#" className="text-gray-600 hover:text-blue-900 transition">Home</a></li>
                        <li><a href="#societa" className="text-gray-600 hover:text-blue-900 transition">Società</a></li>
                        <li><a href="#squadre" className="text-gray-600 hover:text-blue-900 transition">Squadre</a></li>
                        <li><a href="#notizie" className="text-gray-600 hover:text-blue-900 transition">News</a></li>
                        <li><a href="#sponsor" className="text-gray-600 hover:text-blue-900 transition">Partner</a></li>
                    </ul>
                </nav>
                <button className="md:hidden text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
