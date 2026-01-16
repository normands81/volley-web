import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2, Upload, Trash2, Eye } from 'lucide-react';

interface Season {
    idseason: number;
    description: string;
    current: boolean;
}

interface AddNewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNewsAdded: () => void;
    initialData?: any;
}

const AddNewsModal: React.FC<AddNewsModalProps> = ({ isOpen, onClose, onNewsAdded, initialData }) => {
    const [title, setTitle] = useState('');
    const [news_description, setNewsDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [published, setPublished] = useState(true);

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [seasons, setSeasons] = useState<Season[]>([]);
    const [seasonId, setSeasonId] = useState<number | ''>('');

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSeasons();
            if (initialData) {
                setTitle(initialData.title || '');
                setNewsDescription(initialData.news_description || '');
                setEventDate(initialData.event_date || '');
                setPublished(initialData.published ?? true); // Default to true if undefined, but respect false
                setSeasonId(initialData.idseason || '');
                setPhotoPreview(initialData.photo || null);
            } else {
                setTitle('');
                setNewsDescription('');
                setEventDate(new Date().toISOString().split('T')[0]); // Default to today
                setPublished(true);
                setSeasonId('');
                setPhoto(null);
                setPhotoPreview(null);
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    const fetchSeasons = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('TbSeasons')
                .select('idseason, description, current')
                .eq('active', true)
                .order('description', { ascending: false });

            if (error) throw error;
            setSeasons(data || []);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
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

        if (!title || !seasonId || !eventDate) {
            setError('Titolo, Data e Stagione sono obbligatori.');
            return;
        }

        try {
            setFormLoading(true);
            setError(null);

            let photoUrl = initialData?.photo || null;

            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `news_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('news')
                    .upload(filePath, photo);

                if (uploadError) {
                    console.error("Upload error", uploadError);
                    throw new Error(`Upload fallito: ${uploadError.message}`);
                }

                const { data: urlData } = supabase.storage
                    .from('news')
                    .getPublicUrl(filePath);

                photoUrl = urlData.publicUrl;
            } else if (photoPreview === null && initialData?.photo) {
                photoUrl = null;
            }

            const newsData = {
                title,
                news_description,
                event_date: eventDate,
                published,
                idseason: seasonId,
                photo: photoUrl
            };

            let error;
            if (initialData) {
                // Update
                const id = initialData.idnews;
                if (!id) throw new Error("ID news mancante per la modifica");

                const { error: updateError } = await supabase
                    .from('TbNews')
                    .update(newsData)
                    .eq('idnews', id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('TbNews')
                    .insert([newsData]);
                error = insertError;
            }

            if (error) throw error;

            onNewsAdded();
            onClose();

        } catch (err: any) {
            console.error('Error saving news:', err);
            setError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setFormLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">{initialData ? 'Modifica News' : 'Nuova News'}</h2>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                            <textarea
                                value={news_description}
                                onChange={(e) => setNewsDescription(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Evento *</label>
                            <input
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

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
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={published}
                                    onChange={(e) => setPublished(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Pubblicata</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto Principale</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-full md:w-1/2 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 relative group">
                                {photoPreview ? (
                                    <a href={photoPreview} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                            <Eye className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={32} />
                                        </div>
                                    </a>
                                ) : (
                                    <Upload className="text-gray-400" size={32} />
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
                                <div className="flex flex-col space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                                    >
                                        Carica Foto
                                    </button>
                                    {photoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <Trash2 size={14} className="mr-1" /> Rimuovi
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Formati supportati: JPG, PNG.</p>
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
                            'Salva News'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNewsModal;
