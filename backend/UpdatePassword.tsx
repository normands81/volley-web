import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { getAssetPath } from '../utils';

const UpdatePassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(true); // New state to block UI while checking session
    const [hasSession, setHasSession] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            // 1. Check existing session immediately
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                if (mounted) {
                    setHasSession(true);
                    setSessionLoading(false);
                }
                return;
            }

            // 2. If no session, wait a bit for onAuthStateChange (e.g. handling token from URL)
            // We set a timeout to stop waiting eventually
            setTimeout(() => {
                if (mounted && !hasSession) {
                    setSessionLoading(false); // Stop loading, let the UI decide what to show (likely "No session" error)
                }
            }, 4000); // 4 seconds max wait for token parsing
        };

        // Listen for auth changes (token parsed, login success, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("UpdatePassword Auth Event:", event, session);
            if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
                if (session && mounted) {
                    setHasSession(true);
                    setSessionLoading(false);
                    setError(null);
                }
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setHasSession(false);
                    setSessionLoading(false);
                }
            }
        });

        initSession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!hasSession) {
            setError("Sessione scaduta o mancante. Riprova a cliccare sul link della mail.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Le password non coincidono.");
            return;
        }

        if (password.length < 6) {
            setError("La password deve essere di almeno 6 caratteri.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
            } else {
                await supabase.auth.signOut();
                navigate('/backend');
            }
        } catch (err) {
            setError("Si è verificato un errore imprevisto.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (sessionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-libertas-accent px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-libertas-blue mx-auto mb-4"></div>
                    <p className="text-gray-600 font-sans">Verifica sessione in corso...</p>
                    <p className="text-xs text-gray-400 mt-2">Attendere mentre recuperiamo la tua identificazione.</p>
                </div>
            </div>
        );
    }

    if (!hasSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-libertas-accent px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <img
                        src={getAssetPath('/images/logo-libertas.jpg')}
                        alt="Libertas Error"
                        className="w-20 h-20 mx-auto mb-4 grayscale opacity-50"
                    />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Link non valido o scaduto</h2>
                    <p className="text-gray-600 mb-6 font-sans">
                        Non è stato possibile recuperare la sessione di lavoro. Il link di invito potrebbe essere scaduto, oppure è stato già utilizzato.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-left mb-6 text-yellow-800">
                        <strong>Suggerimento:</strong> Assicurati di aver aperto il link nello stesso browser dove stai visualizzando questa pagina. Se il problema persiste, richiedi un nuovo invito.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-libertas-accent px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Form Content */}
                <div className="text-center mb-8">
                    <img
                        src={getAssetPath('/images/logo-libertas.jpg')}
                        alt="Libertas Borgo Volley"
                        className="w-24 h-24 mx-auto mb-4 object-contain rounded-full shadow-md"
                    />
                    <h2 className="text-3xl font-display font-bold text-libertas-blue">Imposta Password</h2>
                    <p className="text-gray-500 mt-2 font-sans">Completa la registrazione del tuo account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-4 border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 font-sans">
                            Nuova Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-libertas-blue focus:border-transparent outline-none transition-all duration-200"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2 font-sans">
                            Conferma Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-libertas-blue focus:border-transparent outline-none transition-all duration-200"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-libertas-blue hover:bg-libertas-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-display uppercase tracking-wider ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Salvataggio...' : 'Imposta Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
