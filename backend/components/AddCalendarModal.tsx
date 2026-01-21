
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2 } from 'lucide-react';

interface Team {
    idteam: number;
    description: string;
    idseason: number;
}

interface CalendarEntry {
    idcalendar?: number;
    idteam: number;
    opponent: string;
    match_date: string;
    match_time: string;
    match_location: string;
    match_id: string;
}

interface AddCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCalendarAdded: () => void;
    initialData?: CalendarEntry;
}

const AddCalendarModal: React.FC<AddCalendarModalProps> = ({ isOpen, onClose, onCalendarAdded, initialData }) => {
    const [teamId, setTeamId] = useState<number | ''>('');
    const [opponent, setOpponent] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [matchTime, setMatchTime] = useState('');
    const [location, setLocation] = useState('');
    const [matchCode, setMatchCode] = useState('');

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
            if (initialData) {
                setTeamId(initialData.idteam);
                setOpponent(initialData.opponent);
                setMatchDate(initialData.match_date ? initialData.match_date.split('T')[0] : '');
                setMatchTime(initialData.match_time || '');
                setLocation(initialData.match_location || '');
                setMatchCode(initialData.match_id || '');
            } else {
                setTeamId('');
                setOpponent('');
                setMatchDate(new Date().toISOString().split('T')[0]);
                setMatchTime('');
                setLocation('');
                setMatchCode('');
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    const fetchTeams = async () => {
        try {
            setLoadingTeams(true);
            const { data, error } = await supabase
                .from('TbTeams')
                .select('idteam, description, idseason')
                .order('description', { ascending: true });

            if (error) throw error;
            setTeams(data || []);
        } catch (err: any) {
            console.error('Error fetching teams:', err);
            setError('Impossibile caricare le squadre.');
        } finally {
            setLoadingTeams(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId || !opponent || !matchDate) {
            setError('Squadra, Avversario e Data sono obbligatori.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                idteam: teamId,
                opponent,
                match_date: matchDate,
                match_time: matchTime,
                match_location: location,
                match_id: matchCode
            };

            let error;

            if (initialData && initialData.idcalendar) {
                // Update
                const { error: updateError } = await supabase
                    .from('TbCalendars')
                    .update(payload)
                    .eq('idcalendar', initialData.idcalendar);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('TbCalendars')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            onCalendarAdded();
            onClose();
        } catch (err: any) {
            console.error('Error saving calendar:', err);
            setError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">{initialData ? 'Modifica Partita' : 'Nuova Partita'}</h2>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Squadra *</label>
                        <select
                            value={teamId}
                            onChange={(e) => setTeamId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingTeams}
                        >
                            <option value="">Seleziona squadra</option>
                            {teams.map((team) => (
                                <option key={team.idteam} value={team.idteam}>
                                    {team.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avversario *</label>
                        <input
                            type="text"
                            value={opponent}
                            onChange={(e) => setOpponent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Es. Volley Savigliano"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                            <input
                                type="date"
                                value={matchDate}
                                onChange={(e) => setMatchDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
                            <input
                                type="time"
                                value={matchTime}
                                onChange={(e) => setMatchTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Es. Palazzetto dello Sport"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Codice Gara (Match ID)</label>
                        <input
                            type="text"
                            value={matchCode}
                            onChange={(e) => setMatchCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Es. 123456"
                        />
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
                            disabled={loading || loadingTeams}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Salvataggio...
                                </>
                            ) : (
                                'Salva Partita'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCalendarModal;
