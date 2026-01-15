import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2, Upload, Trash2 } from 'lucide-react';

interface Team {
    idteam: number;
    description: string;
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

    // Dropdown data
    const [teams, setTeams] = useState<Team[]>([]);

    // Status
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
            if (initialData) {
                // Populate fields
                setName(initialData.name || '');
                setLastname(initialData.lastname || '');
                setBirthDate(initialData.birth_date || '');
                setCertificateDueDate(initialData.certificate_duedate || '');
                setNumber(initialData.number || ''); // Check if view uses 'number' or 'jersey_number'
                setTeamId(initialData.idteam || '');
                setPhotoPreview(initialData.photo_url || initialData.photo || null);
            } else {
                // Reset fields
                setName('');
                setLastname('');
                setBirthDate('');
                setCertificateDueDate('');
                setNumber('');
                setTeamId('');
                setPhoto(null);
                setPhotoPreview(null);
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    const fetchTeams = async () => {
        try {
            setLoading(true);

            // 1. Get current season
            const { data: seasonData, error: seasonError } = await supabase
                .from('TbSeasons')
                .select('idseason')
                .eq('current', true)
                .single();

            if (seasonError) throw seasonError;
            if (!seasonData) throw new Error("No active season found");

            // 2. Get teams for this season
            const { data: teamsData, error: teamsError } = await supabase
                .from('TbTeams')
                .select('idteam, description') // description usually maps to team_name
                .eq('idseason', seasonData.idseason)
                .order('description');

            if (teamsError) throw teamsError;

            // Map description to standardized structure if needed, but the interface matches
            setTeams(teamsData || []);

        } catch (err: any) {
            console.error('Error fetching teams:', err);
            setError('Impossibile caricare le squadre.');
        } finally {
            setLoading(false);
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

        if (!name || !lastname || !teamId) {
            setError('Nome, Cognome e Squadra sono obbligatori.');
            return;
        }

        try {
            setFormLoading(true);
            setError(null);

            let photoUrl = initialData?.photo || null; // standard field name 'photo'

            // Upload photo if a new one is selected
            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                // Supabase bucket 'athletes'
                const { error: uploadError } = await supabase.storage
                    .from('athletes')
                    .upload(filePath, photo);

                if (uploadError) {
                    // Fallback check: try creating bucket? (Can't via client usually)
                    console.error("Upload error", uploadError);
                    // If bucket doesn't exist this will fail.
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
            };

            let error;
            if (initialData) {
                // Update
                // We need to know the primary key (idmember? idathlete?)
                // The view 'vw_teammembers_list' typically joins things.
                // Assuming the PK is passed in initialData or we can infer it.
                // Let's assume 'idmember'.
                const id = initialData.idmember || initialData.id;

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Squadra *</label>
                        <select
                            value={teamId}
                            onChange={(e) => setTeamId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                        >
                            <option value="">Seleziona una squadra</option>
                            {teams.map((team) => (
                                <option key={team.idteam} value={team.idteam}>
                                    {team.description}
                                </option>
                            ))}
                        </select>
                        {loading && <p className="text-xs text-slate-500 mt-1">Caricamento squadre...</p>}
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
                        disabled={formLoading || loading}
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
