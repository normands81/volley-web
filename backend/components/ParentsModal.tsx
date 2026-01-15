import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { X, Loader2, Plus, Trash2, Phone, Mail, User } from 'lucide-react';

interface Parent {
    idparent: number;
    name: string;
    lastname: string;
    email: string | null;
    phone_number: string;
    idteammember: number;
}

interface ParentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    athleteId: number | null;
    athleteName: string;
}

const ParentsModal: React.FC<ParentsModalProps> = ({ isOpen, onClose, athleteId, athleteName }) => {
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (isOpen && athleteId) {
            fetchParents();
            resetForm();
            setShowForm(false);
        }
    }, [isOpen, athleteId]);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('TbParents')
                .select('*')
                .eq('idteammember', athleteId);

            if (error) throw error;
            setParents(data || []);
        } catch (err: any) {
            console.error('Error fetching parents:', err);
            setError('Impossibile caricare i genitori.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setLastname('');
        setEmail('');
        setPhoneNumber('');
        setError(null);
    };

    const handleAddClick = () => {
        resetForm();
        setShowForm(true);
    };

    const handleCancelForm = () => {
        resetForm();
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!athleteId) return;

        if (!name || !lastname || !phoneNumber) {
            setError('Nome, Cognome e Telefono sono obbligatori.');
            return;
        }

        // Phone validation: allows +, digits, spaces, dashes. Min length 8.
        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError('Inserisci un numero di telefono valido.');
            return;
        }

        // Email validation if present
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Inserisci un indirizzo email valido.');
                return;
            }
        }

        try {
            setSubmitting(true);
            const newParent = {
                name,
                lastname,
                email: email || null,
                phone_number: phoneNumber,
                idteammember: athleteId
            };

            const { error } = await supabase
                .from('TbParents')
                .insert([newParent]);

            if (error) throw error;

            await fetchParents();
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            console.error('Error adding parent:', err);
            setError(err.message || 'Errore durante il salvataggio.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Sei sicuro di voler eliminare questo genitore?')) return;

        try {
            const { error } = await supabase
                .from('TbParents')
                .delete()
                .eq('idparent', id);

            if (error) throw error;
            fetchParents();
        } catch (err: any) {
            console.error('Error deleting parent:', err);
            alert('Errore eliminazione: ' + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Genitori / Tutori</h2>
                        <p className="text-sm text-gray-500">Per: {athleteName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 border border-red-100 flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    {!showForm ? (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-blue-600" size={24} />
                                </div>
                            ) : parents.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                    <User size={32} className="mx-auto mb-2 opacity-20" />
                                    <p>Nessun genitore registrato.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {parents.map((p) => (
                                        <div key={p.idparent} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex justify-between items-start group hover:border-blue-200 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{p.name} {p.lastname}</h4>
                                                <div className="space-y-1 mt-2">
                                                    {p.phone_number && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Phone size={14} className="mr-2 text-gray-400" />
                                                            {p.phone_number}
                                                        </div>
                                                    )}
                                                    {p.email && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Mail size={14} className="mr-2 text-gray-400" />
                                                            <a href={`mailto:${p.email}`} className="hover:text-blue-600">{p.email}</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(p.idparent)}
                                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Elimina"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleAddClick}
                                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center font-medium"
                            >
                                <Plus size={18} className="mr-2" />
                                Aggiungi Genitore
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                                    <input
                                        type="text"
                                        value={lastname}
                                        onChange={(e) => setLastname(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCancelForm}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center disabled:opacity-70"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Salvataggio...
                                        </>
                                    ) : (
                                        'Salva'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentsModal;
