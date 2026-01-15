import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Banknote, AlertCircle, Search, Filter, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useDebounce, getAssetPath } from '../utils';
import AddPartnerModal from './components/AddPartnerModal';

const Partners: React.FC = () => {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyCurrentSeason, setOnlyCurrentSeason] = useState(true);
    const [onlyActive, setOnlyActive] = useState(true);

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<any>(null);

    const handlePartnerAdded = () => {
        fetchPartners();
    };

    const handleEditClick = (partner: any) => {
        setSelectedPartner({
            idpartner: partner.idpartner,
            description: partner.partner_description,
            idseason: partner.idseason,
            active: partner.active,
            logo: partner.logo
        });
        setIsAddModalOpen(true);
    };

    const handleAddClick = () => {
        setSelectedPartner(null);
        setIsAddModalOpen(true);
    };

    const handleToggleActive = async (partner: any) => {
        if (!window.confirm(`Sei sicuro di voler ${partner.active ? 'disattivare' : 'riattivare'} questo partner?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('TbPartners')
                .update({ active: !partner.active })
                .eq('idpartner', partner.idpartner);

            if (error) throw error;
            fetchPartners();
        } catch (err: any) {
            console.error('Error toggling active status:', err);
            alert('Errore aggiornamento stato: ' + err.message);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [debouncedSearchTerm, onlyCurrentSeason, onlyActive]);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('vw_partners_list')
                .select('*');

            if (onlyCurrentSeason) {
                query = query.eq('current', true);
            }

            if (onlyActive) {
                query = query.eq('active', true);
            }

            if (debouncedSearchTerm) {
                query = query.ilike('partner_description', `%${debouncedSearchTerm}%`);
            }

            // Order by active first, then name
            query = query.order('active', { ascending: false }).order('partner_description');

            const { data, error } = await query;

            if (error) throw error;
            setPartners(data || []);
        } catch (err: any) {
            console.error('Error fetching partners:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Sponsor & Partner</h1>
                    <p className="text-slate-500 text-sm">Gestisci le partnership e gli sponsor della società.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cerca partner..."
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
                        <span className="font-medium text-sm">Nuovo Partner</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="mr-2" />
                    <p>Errore nel caricamento dei partner: {error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Partner</th>
                                <th className="px-6 py-4 font-semibold">Stagione</th>
                                <th className="px-6 py-4 font-semibold">Stato</th>
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
                            ) : partners.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Nessun partner trovato.
                                    </td>
                                </tr>
                            ) : (
                                partners.map((partner, index) => (
                                    <tr key={index} className={`group transition-colors ${!partner.active ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 p-1">
                                                    {partner.logo ? (
                                                        <img
                                                            src={partner.logo.startsWith('http') ? partner.logo : getAssetPath(partner.logo)}
                                                            alt={partner.partner_description}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <Banknote size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{partner.partner_description}</span>
                                                    <span className="text-xs text-slate-400">ID: {partner.idpartner}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {partner.season_description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${partner.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {partner.active ? 'Attivo' : 'Inattivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(partner)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                    title="Modifica"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(partner)}
                                                    className={`p-1 rounded transition-colors ${partner.active
                                                        ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        : "text-green-500 hover:text-green-700 hover:bg-green-50"
                                                        }`}
                                                    title={partner.active ? "Disattiva" : "Attiva"}
                                                >
                                                    {partner.active ? <Trash2 size={18} /> : <RotateCcw size={18} />}
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

            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onPartnerAdded={handlePartnerAdded}
                initialData={selectedPartner}
            />
        </div>
    );
};

export default Partners;
