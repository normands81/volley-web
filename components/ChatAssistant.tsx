import React, { useState } from 'react';

const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
            >
                <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden border border-gray-100">
                    <div className="bg-blue-900 p-4 flex justify-between items-center">
                        <h3 className="text-white font-bold">Assistente Virtuale</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="h-80 p-4 bg-gray-50 overflow-y-auto">
                        <div className="flex gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">AI</div>
                            <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm text-sm text-gray-700">
                                Ciao! 👋 Come posso aiutarti oggi?
                            </div>
                        </div>
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <input type="text" placeholder="Scrivi un messaggio..." className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 text-sm" />
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </button>
        </>
    );
};

export default ChatAssistant;
