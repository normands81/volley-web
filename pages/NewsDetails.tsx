import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getNewsById } from '../services/newsService';
import { NewsItem } from '../types';
import { getAssetPath } from '../utils';

const getButtonBg = () => getAssetPath('/images/button.jpg');

const NewsDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsItem = async () => {
            if (id) {
                const data = await getNewsById(parseInt(id));
                setNewsItem(data);
            }
            setLoading(false);
        };
        fetchNewsItem();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-xl text-gray-500">Caricamento in corso...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">Notizia non trovata</h2>
                    <p className="text-gray-600 mb-8">Ci dispiace, non siamo riusciti a trovare la notizia che stavi cercando.</p>
                    <Link to="/" className="bg-libertas-blue text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition">
                        Torna alla Home
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12">
                <article className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
                    <div className="relative h-[400px] md:h-[500px]">
                        <img
                            src={newsItem.image ? getAssetPath(newsItem.image) : getButtonBg()}
                            alt={newsItem.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const fallback = getButtonBg();
                                if (!target.src.endsWith(fallback)) {
                                    target.src = fallback;
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                            <div className="inline-block bg-libertas-blue px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 shadow-sm">
                                {new Date(newsItem.event_date).toLocaleDateString()}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display font-black leading-tight mb-2 drop-shadow-md">
                                {newsItem.title}
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans">
                            <p className="whitespace-pre-line">{newsItem.description}</p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                            <Link to="/" className="inline-flex items-center text-libertas-blue font-bold hover:text-blue-800 transition group">
                                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Torna alla Homepage
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
};

export default NewsDetails;
