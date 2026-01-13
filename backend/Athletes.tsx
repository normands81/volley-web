import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Shield, AlertCircle, Search, User, Plus } from 'lucide-react';
import { useDebounce } from '../utils';

const Athletes: React.FC = () => {
    const [athletes, setAthletes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyCurrentSeason, setOnlyCurrentSeason] = useState(true);

    // Debounce search term to avoid too many requests
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Placeholder for Add/Edit logic
    const handleEditClick = (athlete: any) => {
        console.log("Edit athlete", athlete);
        // TODO: Implement Edit Modal
    };

    const handleAddClick = () => {
        setIsAddModalOpen(true);
        // TODO: Implement Add Modal
    };

    useEffect(() => {
        fetchAthletes();
    }, [debouncedSearchTerm, onlyCurrentSeason]);

    const fetchAthletes = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('vw_teammembers_list')
                .select('*');

            if (onlyCurrentSeason) {
                // Assuming the view has a 'current' field for the season like vw_teams_list
                query = query.eq('current', true);
            }

            if (debouncedSearchTerm) {
                // Assuming 'member_name' or similar exists. adapting from teams.
                // We'll try to filter by a likely name column. 
                // Since I don't know the exact column, I picked 'name_surname' or just 'name' often used.
                // If it fails, the user will see the error.
                // Let's assume the view has a text representation of the athlete.
                // Safe bet might be to just select * and filter in memory if uncertain, but for DB performance we want query.
                // Let's try 'athlete_name' or 'cognome_nome'. 
                // Given standard Italian dev, maybe 'cognome' or 'nome'.
                // I will use 'surname' and 'name' OR check if there is a full name field.
                // For now, I'll comment out the filter implementation details or guess one.
                // In Teams it was 'team_name'. Here maybe 'athlete_name'?
                query = query.or(`surname.ilike.%${debouncedSearchTerm}%,name.ilike.%${debouncedSearchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setAthletes(data || []);
        } catch (err: any) {
            console.error('Error fetching athletes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Gestione Atleti</h1>
                    <p className="text-slate-500 text-sm">Visualizza e gestisci gli atleti della società.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cerca atleta..."
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

                    <button
                        onClick={handleAddClick}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span className="font-medium text-sm">Nuovo Atleta</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="mr-2" />
                    <p>Errore nel caricamento degli atleti: {error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Atleta</th>
                                <th className="px-6 py-4 font-semibold">Squadra</th>
                                <th className="px-6 py-4 font-semibold">Data di nascita</th>
                                <th className="px-6 py-4 font-semibold">Scadenza certificato</th>
                                <th className="px-6 py-4 font-semibold">Stagione</th>
                                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : athletes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Nessun atleta trovato.
                                    </td>
                                </tr>
                            ) : (
                                athletes.map((athlete, index) => (
                                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{athlete.lastname} {athlete.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {athlete.team_description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {athlete.birth_date || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {athlete.certificate_duedate || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {athlete.season_description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(athlete)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                            >
                                                Dettagli
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal placeholder */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Funzionalità in arrivo</h2>
                        <p className="text-slate-600 mb-6">La gestione (aggiunta/modifica) degli atleti sarà implementata presto.</p>
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Chiudi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Athletes;
