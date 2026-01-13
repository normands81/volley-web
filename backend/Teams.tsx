import React from 'react';
import { supabase } from '../services/supabaseClient';
import { Shield, AlertCircle } from 'lucide-react';

const Teams: React.FC = () => {
    const [teams, setTeams] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('teams_list')
                .select('*')
                .eq('current', true);

            if (error) throw error;
            setTeams(data || []);
        } catch (err: any) {
            console.error('Error fetching teams:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
                <AlertCircle className="mr-2" />
                <p>Errore nel caricamento delle squadre: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Gestione Squadre</h1>
                    <p className="text-slate-500 text-sm">Visualizza e gestisci le squadre della società.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nome Squadra</th>
                                <th className="px-6 py-4 font-semibold">Categoria</th>
                                <th className="px-6 py-4 font-semibold">Stagione</th>
                                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teams.length === 0 ? (
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
                                                <span>{team.team_name || team.team_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {team.season_description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {team.idteam || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
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
        </div>
    );
};

export default Teams;
