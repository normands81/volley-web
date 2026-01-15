import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2, Upload, Trash2 } from 'lucide-react';

interface Season {
    idseason: number;
    description: string;
    current: boolean;
}

interface AddPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPartnerAdded: () => void;
    initialData?: any;
}

const AddPartnerModal: React.FC<AddPartnerModalProps> = ({ isOpen, onClose, onPartnerAdded, initialData }) => {
    const [description, setDescription] = useState('');
    const [seasonId, setSeasonId] = useState<number | ''>('');
    const [isActive, setIsActive] = useState(true);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // State for seasons
    const [seasons, setSeasons] = useState<Season[]>([]);

    // Status
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSeasons();
            if (initialData) {
                // Populate fields
                setDescription(initialData.description || '');
                setSeasonId(initialData.idseason || '');
                setIsActive(initialData.active !== undefined ? initialData.active : true);
                setLogoPreview(initialData.logo || null);
            } else {
                // Reset fields
                setDescription('');
                setSeasonId('');
                setIsActive(true);
                setLogo(null);
                setLogoPreview(null);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);

            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setLogoPreview(objectUrl);
        }
    };

    const handleRemoveLogo = () => {
        setLogo(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !seasonId) {
            setError('Descrizione e Stagione sono obbligatori.');
            return;
        }

        try {
            setFormLoading(true);
            setError(null);

            let logoUrl = initialData?.logo || null;

            // Upload logo if a new one is selected
            if (logo) {
                const fileExt = logo.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('partners')
                    .upload(filePath, logo);

                if (uploadError) {
                    throw new Error(`Upload fallito: ${uploadError.message}`);
                }

                const { data: urlData } = supabase.storage
                    .from('partners')
                    .getPublicUrl(filePath);

                logoUrl = urlData.publicUrl;
            } else if (logoPreview === null && initialData?.logo) {
                // If preview was cleared, user wants to remove logo
                logoUrl = null;
            }

            const partnerData = {
                description,
                idseason: seasonId,
                active: isActive,
                logo: logoUrl
            };

            let error;
            if (initialData) {
                // Update
                const { error: updateError } = await supabase
                    .from('TbPartners')
                    .update(partnerData)
                    .eq('idpartner', initialData.idpartner);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('TbPartners')
                    .insert([partnerData]);
                error = insertError;
            }

            if (error) throw error;

            onPartnerAdded();
            onClose();

        } catch (err: any) {
            console.error('Error saving partner:', err);
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
                    <h2 className="text-lg font-bold text-gray-800">{initialData ? 'Modifica Partner' : 'Nuovo Partner'}</h2>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione *</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
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
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">Attivo</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
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
                                        Carica Logo
                                    </button>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
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
                            'Salva Partner'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPartnerModal;
