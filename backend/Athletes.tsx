import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Shield, AlertCircle, Search, User, Plus, Pencil, Trash2, RotateCcw, Users } from 'lucide-react';
import { useDebounce } from '../utils';
import AddAthleteModal from './components/AddAthleteModal';
import ParentsModal from './components/ParentsModal';

const Athletes: React.FC = () => {
    const [athletes, setAthletes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyCurrentSeason, setOnlyCurrentSeason] = useState(true);
    const [onlyActive, setOnlyActive] = useState(true);

    // Debounce search term to avoid too many requests
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isParentsModalOpen, setIsParentsModalOpen] = useState(false);
    const [selectedAthlete, setSelectedAthlete] = useState<any>(null);

    const handleAthleteAdded = () => {
        fetchAthletes();
    };

    const handleParentsClick = (athlete: any) => {
        setSelectedAthlete(athlete);
        setIsParentsModalOpen(true);
    };

    const handleEditClick = (athlete: any) => {
        setSelectedAthlete(athlete);
        setIsAddModalOpen(true);
    };

    const handleToggleActive = async (athlete: any) => {
        const action = athlete.active ? "cancellare" : "ripristinare";
        if (!window.confirm(`Sei sicuro di voler ${action} questo atleta?`)) {
            return;
        }

        const id = athlete.idteammember || athlete.idmember || athlete.id;
        if (!id) {
            console.error("ID not found for athlete", athlete);
            alert("Impossibile trovare l'ID dell'atleta.");
            return;
        }

        try {
            const newActive = !athlete.active;
            const { error } = await supabase
                .from('TbTeamsMembers')
                .update({ active: newActive })
                .eq('idteammember', id);

            if (error) throw error;

            fetchAthletes();
        } catch (err: any) {
            console.error("Error toggling active status", err);
            alert("Errore durante l'aggiornamento: " + err.message);
        }
    };

    const handleAddClick = () => {
        setSelectedAthlete(null);
        setIsAddModalOpen(true);
    };

    useEffect(() => {
        fetchAthletes();
    }, [debouncedSearchTerm, onlyCurrentSeason, onlyActive]);

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

            if (onlyActive) {
                query = query.eq('active', true);
            }

            if (debouncedSearchTerm) {
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

                    <label className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 select-none">
                        <input
                            type="checkbox"
                            checked={onlyActive}
                            onChange={(e) => setOnlyActive(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Solo attivi</span>
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
                                <th className="px-6 py-4 font-semibold">Numero</th>
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
                            ) : athletes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        Nessun atleta trovato.
                                    </td>
                                </tr>
                            ) : (
                                athletes.map((athlete, index) => (
                                    <tr key={index} className={`group transition-colors ${!athlete.active ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {athlete.photo ? (
                                                        <img src={athlete.photo} alt={`${athlete.name} ${athlete.lastname}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={18} className="text-slate-400" />
                                                    )}
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
                                            {athlete.number || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {athlete.season_description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(athlete)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                    title="Modifica"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleParentsClick(athlete)}
                                                    className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                                                    title="Genitori"
                                                >
                                                    <Users size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(athlete)}
                                                    className={`p-1 rounded transition-colors ${athlete.active
                                                        ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        : "text-green-600 hover:text-green-800 hover:bg-green-50"
                                                        }`}
                                                    title={athlete.active ? "Disattiva" : "Ripristina"}
                                                >
                                                    {athlete.active ? (
                                                        <Trash2 size={18} />
                                                    ) : (
                                                        <RotateCcw size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddAthleteModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAthleteAdded={handleAthleteAdded}
                initialData={selectedAthlete}
            />

            <ParentsModal
                isOpen={isParentsModalOpen}
                onClose={() => setIsParentsModalOpen(false)}
                athleteId={selectedAthlete?.idteammember || selectedAthlete?.idmember || selectedAthlete?.id}
                athleteName={`${selectedAthlete?.name} ${selectedAthlete?.lastname}`}
            />
        </div>
    );
};

export default Athletes;
