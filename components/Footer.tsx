import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetPath } from '../utils';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <div className="text-2xl font-black text-white tracking-tighter mb-6">
                            <img src={getAssetPath('/images/logo-libertas.jpg')} alt="Libertas Borgo Volley" className="h-12 w-auto" />
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            La società di riferimento per la pallavolo a Borgo San Dalmazzo. Dal minivolley alla prima squadra, una grande famiglia unita dalla passione.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Contatti</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start">
                                <span className="mr-3 mt-1">📍</span>
                                Palazzetto dello Sport<br />Via Giovanni XXIII, Borgo San Dalmazzo
                            </li>
                            <li className="flex items-center">
                                <span className="mr-3">📧</span>
                                info@libertasborgo.it
                            </li>
                            <li className="flex items-center">
                                <span className="mr-3">📞</span>
                                +39 0171 123456
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Link Rapidi</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-yellow-500 transition">Chi Siamo</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition">Le Squadre</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition">Iscrizioni</a></li>
                            <li><Link to="/backend" className="hover:text-yellow-500 transition">Area Riservata</Link></li>
                            <li><a href="#" className="hover:text-yellow-500 transition">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Seguici</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition">FB</a>
                            <a href="#" className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center hover:bg-pink-500 transition">IG</a>
                            <a href="#" className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center hover:bg-sky-400 transition">TW</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm flex flex-col items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} Libertas Borgo Volley ASD. Tutti i diritti riservati.</p>
                    <Link to="/backend" className="text-gray-700 hover:text-gray-500 transition-colors" aria-label="Login Admin">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
