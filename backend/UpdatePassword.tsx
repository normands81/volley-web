import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { getAssetPath } from '../utils';

const UpdatePassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session. If not, the user might have accessed this page directly without an invite link.
        // However, Supabase usually handles the hash fragment parsing and session recovery automatically.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Without a session, they can't update their password (unless using a recovery token, but invite flow usually establishes a session).
                // For now, we'll let them try, but Supabase will likely reject it if no session.
                // Ideally, we'd redirect to login if no session is found after a short delay, but let's allow the form to render.
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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
                // Success! Redirect to login page as requested.
                // We might want to sign them out first to force a fresh login with the new password,
                // or just redirect them. The user asked to "redirect to login page".
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-libertas-accent px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
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
