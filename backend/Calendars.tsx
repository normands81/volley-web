import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { AlertCircle, Search, Plus, Edit2 } from 'lucide-react';
import { useDebounce } from '../utils';
import AddCalendarModal from './components/AddCalendarModal';

const Calendars: React.FC = () => {
    const [calendars, setCalendars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCalendar, setSelectedCalendar] = useState<any | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyCurrentSeason, setOnlyCurrentSeason] = useState(true);

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        fetchCalendars();
    }, [debouncedSearchTerm, onlyCurrentSeason]);

    const fetchCalendars = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('vw_calendars_list')
                .select('*');

            if (onlyCurrentSeason) {
                query = query.eq('current', true);
            }

            if (debouncedSearchTerm) {
                query = query.or(`team_description.ilike.%${debouncedSearchTerm}%,opponent.ilike.%${debouncedSearchTerm}%,match_id.ilike.%${debouncedSearchTerm}%`);
            }

            // Order by date descending by default
            query = query.order('match_date', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setCalendars(data || []);
        } catch (err: any) {
            console.error('Error fetching vcalendars:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCalendar = () => {
        setSelectedCalendar(null);
        setIsModalOpen(true);
    };

    const handleEditCalendar = (calendar: any) => {
        setSelectedCalendar(calendar);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCalendar(null);
    };

    const handleCalendarAdded = () => {
        fetchCalendars();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Calendari</h1>
                    <p className="text-slate-500 text-sm">Visualizza il calendario partite.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cerca partita..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                            />
                        </div>

                        <label className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 select-none">
                            <input
                                type="checkbox"
                                checked={onlyCurrentSeason}
                                onChange={(e) => setOnlyCurrentSeason(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Stagione corrente</span>
                        </label>
                    </div>

                    <button
                        onClick={handleAddCalendar}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span>Nuova Partita</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="mr-2" />
                    <p>Errore nel caricamento dei calendari: {error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Data/Ora</th>
                                <th className="px-6 py-4 font-semibold">Codice</th>
                                <th className="px-6 py-4 font-semibold">Squadra</th>
                                <th className="px-6 py-4 font-semibold">Avversario</th>
                                <th className="px-6 py-4 font-semibold">Luogo</th>
                                <th className="px-6 py-4 font-semibold">Stagione</th>
                                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : calendars.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        Nessuna partita trovata.
                                    </td>
                                </tr>
                            ) : (
                                calendars.map((calendar, index) => (
                                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex flex-col">
                                                <span>{calendar.match_date ? new Date(calendar.match_date).toLocaleDateString() : '-'}</span>
                                                <span className="text-xs text-slate-400">{calendar.match_time || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {calendar.match_id || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {calendar.team_description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {calendar.opponent || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {calendar.match_location || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            <span className="bg-slate-100 px-2 py-1 rounded-full">
                                                {calendar.season_description || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditCalendar(calendar)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                                                title="Modifica"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddCalendarModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onCalendarAdded={handleCalendarAdded}
                initialData={selectedCalendar}
            />
        </div>
    );
};

export default Calendars;
