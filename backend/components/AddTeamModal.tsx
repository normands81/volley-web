import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2 } from 'lucide-react';

interface Season {
    id: number;
    description: string;
    current: boolean;
}

interface AddTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTeamAdded: () => void;
}

const AddTeamModal: React.FC<AddTeamModalProps> = ({ isOpen, onClose, onTeamAdded }) => {
    const [name, setName] = useState('');
    const [seasonId, setSeasonId] = useState<number | ''>('');
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSeasons, setLoadingSeasons] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSeasons();
            setName('');
            setSeasonId('');
            setError(null);
        }
    }, [isOpen]);

    const fetchSeasons = async () => {
        try {
            setLoadingSeasons(true);
            const { data, error } = await supabase
                .from('TbSeasons')
                .select('*')
                .order('description', { ascending: false });

            if (error) throw error;

            setSeasons(data || []);
            // Auto-select current season if available
            const currentSeason = data?.find((s: Season) => s.current);
            if (currentSeason) {
                setSeasonId(currentSeason.id);
            }
        } catch (err: any) {
            console.error('Error fetching seasons:', err);
            setError('Impossibile caricare le stagioni.');
        } finally {
            setLoadingSeasons(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !seasonId) {
            setError('Compila tutti i campi obbligatori.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { error } = await supabase
                .from('teams')
                .insert([
                    { description: name, idseason: seasonId }
                ]);

            if (error) throw error;

            onTeamAdded();
            onClose();
        } catch (err: any) {
            console.error('Error adding team:', err);
            setError(err.message || 'Errore durante l\'aggiunta della squadra.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Nuova Squadra</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Squadra *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Es. Under 14 Femminile"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stagione *
                        </label>
                        <select
                            value={seasonId}
                            onChange={(e) => setSeasonId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingSeasons}
                        >
                            <option value="">Seleziona stagione</option>
                            {seasons.map((season) => (
                                <option key={season.id} value={season.id}>
                                    {season.description} {season.current ? '(Corrente)' : ''}
                                </option>
                            ))}
                        </select>
                        {loadingSeasons && <p className="text-xs text-gray-500 mt-1">Caricamento stagioni...</p>}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={loading || loadingSeasons}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Salvataggio...
                                </>
                            ) : (
                                'Salva Squadra'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTeamModal;
