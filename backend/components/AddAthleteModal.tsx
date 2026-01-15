import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2, Upload, Trash2 } from 'lucide-react';

interface Team {
    idteam: number;
    description: string;
}

interface Season {
    idseason: number;
    description: string;
    current: boolean;
}

interface AddAthleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAthleteAdded: () => void;
    initialData?: any;
}

const AddAthleteModal: React.FC<AddAthleteModalProps> = ({ isOpen, onClose, onAthleteAdded, initialData }) => {
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [certificateDueDate, setCertificateDueDate] = useState('');
    const [number, setNumber] = useState('');
    const [teamId, setTeamId] = useState<number | ''>('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // State for seasons and teams
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [seasonId, setSeasonId] = useState<number | ''>('');
    const [teams, setTeams] = useState<Team[]>([]);

    // Status
    const [loading, setLoading] = useState(false);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSeasons();
            if (initialData) {
                // Populate fields
                setName(initialData.name || '');
                setLastname(initialData.lastname || '');
                setBirthDate(initialData.birth_date || '');
                setCertificateDueDate(initialData.certificate_duedate || '');
                setNumber(initialData.number || ''); // Check if view uses 'number' or 'jersey_number'

                // Set season if available in initialData
                if (initialData.idseason) {
                    setSeasonId(initialData.idseason);
                }

                setTeamId(initialData.idteam || '');
                setPhotoPreview(initialData.photo_url || initialData.photo || null);
            } else {
                // Reset fields
                setName('');
                setLastname('');
                setBirthDate('');
                setCertificateDueDate('');
                setNumber('');
                setSeasonId('');
                setTeamId('');
                setPhoto(null);
                setPhotoPreview(null);
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    // Fetch teams when seasonId changes
    useEffect(() => {
        if (seasonId) {
            fetchTeams(Number(seasonId));
        } else {
            setTeams([]);
            if (!initialData) setTeamId(''); // Reset team selection if changing season (unless editing initial load might differ, but generally safer)
        }
    }, [seasonId]);

    const fetchSeasons = async () => {
        try {
            setLoading(true);
            // Fetch all active seasons
            const { data, error } = await supabase
                .from('TbSeasons')
                .select('idseason, description, current')
                .eq('active', true)
                .order('description', { ascending: false });

            if (error) throw error;
            setSeasons(data || []);

            // If not editing and no season selected, select current season default
            if (!initialData && data) {
                const current = data.find((s: Season) => s.current);
                if (current) {
                    setSeasonId(current.idseason);
                }
            }
        } catch (err: any) {
            console.error('Error fetching seasons:', err);
            setError('Impossibile caricare le stagioni.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async (selectedSeasonId: number) => {
        try {
            setTeamsLoading(true);
            const { data: teamsData, error: teamsError } = await supabase
                .from('TbTeams')
                .select('idteam, description')
                .eq('idseason', selectedSeasonId)
                .order('description');

            if (teamsError) throw teamsError;

            setTeams(teamsData || []);
        } catch (err: any) {
            console.error('Error fetching teams:', err);
            setError('Impossibile caricare le squadre.');
        } finally {
            setTeamsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);

            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setPhotoPreview(objectUrl);
        }
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !lastname || !teamId || !seasonId) {
            setError('Nome, Cognome, Stagione e Squadra sono obbligatori.');
            return;
        }

        try {
            setFormLoading(true);
            setError(null);

            let photoUrl = initialData?.photo || null;

            // Upload photo if a new one is selected
            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                // Supabase bucket 'athletes' (as per user edit)
                const { error: uploadError } = await supabase.storage
                    .from('athletes')
                    .upload(filePath, photo);

                if (uploadError) {
                    console.error("Upload error", uploadError);
                    throw new Error(`Upload fallito: ${uploadError.message}`);
                }

                const { data: urlData } = supabase.storage
                    .from('athletes')
                    .getPublicUrl(filePath);

                photoUrl = urlData.publicUrl;
            } else if (photoPreview === null && initialData?.photo) {
                // If preview was cleared, user wants to remove photo
                photoUrl = null;
            }

            const athleteData = {
                name,
                lastname,
                birth_date: birthDate || null,
                certificate_duedate: certificateDueDate || null,
                number: number || null,
                idteam: teamId,
                photo: photoUrl
                // Note: idseason is usually inferred from idteam in the backend/DB if normalized,
                // but if TbTeamsMembers doesn't store idseason, we don't send it. 
                // Based on standard schema, Member -> Team -> Season.
            };

            let error;
            if (initialData) {
                // Update
                // using idteammember as per user edit to schema/view
                const id = initialData.idteammember || initialData.idmember || initialData.id;

                if (!id) throw new Error("ID atleta mancante per la modifica");

                const { error: updateError } = await supabase
                    .from('TbTeamsMembers')
                    .update(athleteData)
                    .eq('idteammember', id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('TbTeamsMembers')
                    .insert([athleteData]);
                error = insertError;
            }

            if (error) throw error;

            onAthleteAdded();
            onClose();

        } catch (err: any) {
            console.error('Error saving athlete:', err);
            setError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setFormLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">{initialData ? 'Modifica Atleta' : 'Nuovo Atleta'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                            <input
                                type="text"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Numero Maglia</label>
                            <input
                                type="text"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scadenza Certificato</label>
                        <input
                            type="date"
                            value={certificateDueDate}
                            onChange={(e) => setCertificateDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Season Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stagione *</label>
                        <select
                            value={seasonId}
                            onChange={(e) => setSeasonId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                        >
                            <option value="">Seleziona una stagione</option>
                            {seasons.map((season) => (
                                <option key={season.idseason} value={season.idseason}>
                                    {season.description} {season.current ? '(Corrente)' : ''}
                                </option>
                            ))}
                        </select>
                        {loading && <p className="text-xs text-slate-500 mt-1">Caricamento stagioni...</p>}
                    </div>

                    {/* Team Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Squadra *</label>
                        <select
                            value={teamId}
                            onChange={(e) => setTeamId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={teamsLoading || !seasonId}
                        >
                            <option value="">Seleziona una squadra</option>
                            {teams.map((team) => (
                                <option key={team.idteam} value={team.idteam}>
                                    {team.description}
                                </option>
                            ))}
                        </select>
                        {teamsLoading && <p className="text-xs text-slate-500 mt-1">Caricamento squadre...</p>}
                        {!seasonId && <p className="text-xs text-amber-500 mt-1">Seleziona prima una stagione</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto Profilo</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="text-gray-400" size={24} />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        Carica Foto
                                    </button>
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center"
                                        >
                                            <Trash2 size={14} className="mr-1" /> Rimuovi
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Formati supportati: JPG, PNG. Max 5MB.</p>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors shadow-sm"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={formLoading || loading || teamsLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm flex items-center disabled:opacity-50"
                    >
                        {formLoading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={16} />
                                Salvataggio...
                            </>
                        ) : (
                            'Salva Atleta'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAthleteModal;
