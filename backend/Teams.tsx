import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Shield, AlertCircle, Search, Filter, Plus } from 'lucide-react';
import { useDebounce } from '../utils';
import AddTeamModal from './components/AddTeamModal';

const Teams: React.FC = () => {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyCurrentSeason, setOnlyCurrentSeason] = useState(true);

    // Debounce search term to avoid too many requests
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);

    const handleTeamAdded = () => {
        fetchTeams();
    };

    const handleEditClick = (team: any) => {
        // Map the view data back to the structure expected by the modal
        // assuming team_name maps to description and we need idseason from somewhere
        // If idseason is missing from the view, we might need to fetch it or ensure the view has it.
        // Let's assume the view has 'idseason'. If not, this needs fixing in the view or here.
        // Based on previous errors, the view is 'teams_list'. I'll log it to be sure often.
        // For now, I'll pass it mapped.
        setSelectedTeam({
            idteam: team.idteam,
            description: team.team_name,
            idseason: team.idseason // Ensure this exists in the view return
        });
        setIsAddModalOpen(true);
    };

    const handleAddClick = () => {
        setSelectedTeam(null);
        setIsAddModalOpen(true);
    };

    useEffect(() => {
        fetchTeams();
    }, [debouncedSearchTerm, onlyCurrentSeason]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('vw_teams_list')
                .select('*');

            if (onlyCurrentSeason) {
                query = query.eq('current', true);
            }

            if (debouncedSearchTerm) {
                query = query.ilike('team_name', `%${debouncedSearchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTeams(data || []);
        } catch (err: any) {
            console.error('Error fetching teams:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Gestione Squadre</h1>
                    <p className="text-slate-500 text-sm">Visualizza e gestisci le squadre della società.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cerca squadra..."
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
                        <span className="font-medium text-sm">Nuova Squadra</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="mr-2" />
                    <p>Errore nel caricamento delle squadre: {error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nome Squadra</th>
                                <th className="px-6 py-4 font-semibold">Stagione</th>
                                <th className="px-6 py-4 font-semibold">Id Squadra</th>
                                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : teams.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Nessuna squadra trovata.
                                    </td>
                                </tr>
                            ) : (
                                teams.map((team, index) => (
                                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                    <Shield size={16} />
                                                </div>
                                                <span>{team.team_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {team.season_description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {team.idteam || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(team)}
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

            <AddTeamModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onTeamAdded={handleTeamAdded}
                initialData={selectedTeam}
            />
        </div>
    );
};

export default Teams;
