import React from 'react';

const Calendars: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Calendari</h1>
                    <p className="text-slate-500 text-sm">Gestione calendari (In Costruzione)</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                <p className="text-slate-500">Funzionalità in arrivo.</p>
            </div>
        </div>
    );
};

export default Calendars;
