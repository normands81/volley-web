import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Newspaper, AlertCircle, Search, Plus, Pencil, Trash2, RotateCcw, Image } from 'lucide-react';
import { useDebounce } from '../utils';
import AddNewsModal from './components/AddNewsModal';

const News: React.FC = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyCurrentSeason, setOnlyCurrentSeason] = useState(true);
    const [onlyActive, setOnlyActive] = useState(false); // Default false to show drafts too
    const [currentSeasonId, setCurrentSeasonId] = useState<number | null>(null);

    // Debounce search term to avoid too many requests
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<any>(null);

    const handleNewsAdded = () => {
        fetchNews();
    };

    const handleEditClick = (newsItem: any) => {
        setSelectedNews(newsItem);
        setIsAddModalOpen(true);
    };

    const handleTogglePublished = async (newsItem: any) => {
        const action = newsItem.published ? "nascondere" : "pubblicare";
        if (!window.confirm(`Sei sicuro di voler ${action} questa news?`)) {
            return;
        }

        const id = newsItem.idnews;
        if (!id) {
            console.error("ID not found for news", newsItem);
            return;
        }

        try {
            const newPublished = !newsItem.published;
            const { error } = await supabase
                .from('TbNews')
                .update({ published: newPublished })
                .eq('idnews', id);

            if (error) throw error;

            fetchNews();
        } catch (err: any) {
            console.error("Error toggling published status", err);
            alert("Errore durante l'aggiornamento: " + err.message);
        }
    };

    const handleDeleteClick = async (newsItem: any) => {
        if (!window.confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE questa news?`)) {
            return;
        }

        const id = newsItem.idnews;
        try {
            const { error } = await supabase
                .from('TbNews')
                .delete()
                .eq('idnews', id);

            if (error) throw error;

            fetchNews();
        } catch (err: any) {
            console.error("Error deleting news", err);
            alert("Errore durante l'eliminazione: " + err.message);
        }
    }

    const handleAddClick = () => {
        setSelectedNews(null);
        setIsAddModalOpen(true);
    };

    useEffect(() => {
        const fetchCurrentSeason = async () => {
            const { data } = await supabase
                .from('TbSeasons')
                .select('idseason')
                .eq('current', true)
                .single();
            if (data) setCurrentSeasonId(data.idseason);
        };
        fetchCurrentSeason();
    }, []);

    useEffect(() => {
        if (currentSeasonId || !onlyCurrentSeason) {
            fetchNews();
        }
    }, [debouncedSearchTerm, onlyCurrentSeason, onlyActive, currentSeasonId]);

    const fetchNews = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('vw_news_list')
                .select('*')
                .order('event_date', { ascending: false });

            if (onlyCurrentSeason && currentSeasonId) {
                query = query.eq('idseason', currentSeasonId);
            }

            if (onlyActive) {
                query = query.eq('published', true);
            }

            if (debouncedSearchTerm) {
                query = query.ilike('title', `%${debouncedSearchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setNews(data || []);
        } catch (err: any) {
            console.error('Error fetching news:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }


    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Gestione News</h1>
                    <p className="text-slate-500 text-sm">Crea e gestisci gli articoli e le news.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cerca news..."
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
                        <span className="text-sm font-medium text-slate-700">Solo pubblicate</span>
                    </label>

                    <button
                        onClick={handleAddClick}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span className="font-medium text-sm">Nuova News</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="mr-2" />
                    <p>Errore nel caricamento delle news: {error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Titolo</th>
                                <th className="px-6 py-4 font-semibold">Data Evento</th>
                                <th className="px-6 py-4 font-semibold">Stagione</th>
                                <th className="px-6 py-4 font-semibold">Stato</th>
                                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : news.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Nessuna news trovata.
                                    </td>
                                </tr>
                            ) : (
                                news.map((item, index) => (
                                    <tr key={index} className={`group transition-colors ${!item.published ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {item.photo ? (
                                                        <img src={item.photo} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Image size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium line-clamp-1" title={item.title}>{item.title}</div>
                                                    <div className="text-xs text-slate-500 line-clamp-1">{item.news_description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {formatDate(item.event_date)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {item.season_description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.published ? 'Pubblicato' : 'Bozza'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                    title="Modifica"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePublished(item)}
                                                    className={`p-1 rounded transition-colors ${!item.published
                                                        ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                                                        : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                                        }`}
                                                    title={item.published ? "Sposta in bozze" : "Pubblica"}
                                                >
                                                    {item.published ? (
                                                        <RotateCcw size={18} />
                                                    ) : (
                                                        <Newspaper size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                    title="Elimina"
                                                >
                                                    <Trash2 size={18} />
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

            <AddNewsModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onNewsAdded={handleNewsAdded}
                initialData={selectedNews}
            />
        </div>
    );
};

export default News;
