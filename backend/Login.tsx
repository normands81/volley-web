import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAssetPath } from '../utils';
import { supabase } from '../services/supabaseClient';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (data.user) {
                navigate('/');
            }
        } catch (err) {
            setError('Si è verificato un errore imprevisto.');
            console.error('Login error:', err);
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
                        onError={(e) => {
                            // Fallback if logo not found, just hide or show text
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <h2 className="text-3xl font-display font-bold text-libertas-blue">Admin Login</h2>
                    <p className="text-gray-500 mt-2 font-sans">Accedi all'area riservata</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-4 border border-red-200">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 font-sans">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-libertas-blue focus:border-transparent outline-none transition-all duration-200"
                                placeholder="nome@esempio.it"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 font-sans">
                            Password
                        </label>
                        <div className="relative">
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
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-libertas-blue hover:bg-libertas-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-display uppercase tracking-wider"
                    >
                        Accedi
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-libertas-blue hover:underline transition-colors duration-200 font-sans flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Torna alla Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
