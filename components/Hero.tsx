import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-background.png"
                    alt="Volley Action"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if image doesn't exist
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/id/1059/1920/1080';
                    }}
                />
                <div className="absolute inset-0 bg-blue-900/70 mix-blend-multiply"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <span className="block text-yellow-400 font-bold tracking-widest uppercase mb-4 animate-fade-in-up">Stagione 2024/2025</span>
                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up delay-100">
                    PASSIONE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">SOTTO RETE</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
                    La pallavolo nel cuore di Borgo San Dalmazzo. Cresciamo talenti, costruiamo squadre, viviamo emozioni.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                    <button className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition transform hover:scale-105 shadow-lg shadow-yellow-500/30">
                        Unisciti a Noi
                    </button>
                    <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition">
                        Calendario Partite
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
