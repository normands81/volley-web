import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Section from '../components/Section';
import Footer from '../components/Footer';

import { MatchResult, NewsItem, Team, Partner } from '../types';
import { getTeams } from '../services/teamService';
import { getPartners } from '../services/partnerService';
import { getAssetPath } from '../utils';

const getButtonBg = () => getAssetPath('/images/button.jpg');

const Home: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const data = await getTeams();
      setTeams(data);
    };
    const fetchPartners = async () => {
      const data = await getPartners();
      setPartners(data);
    };
    fetchTeams();
    fetchPartners();
  }, []);

  const match: MatchResult = {
    id: 1,
    homeTeam: "Libertas Borgo",
    awayTeam: "Cuneo Volley",
    homeScore: 0,
    awayScore: 0,
    date: "Sabato 24 Maggio, 18:00",
    category: "Serie C Maschile"
  };

  const news: NewsItem[] = [
    {
      id: 1,
      title: "Vittoria schiacciante in trasferta!",
      excerpt: "La nostra Under 16 espugna il campo di Alba con un netto 3-0. Grandissima prestazione di squadra.",
      date: "12 Maggio 2024",
      imageUrl: "https://picsum.photos/id/158/400/250"
    },
    {
      id: 2,
      title: "Open Day Minivolley",
      excerpt: "Sabato prossimo porte aperte per tutti i bambini dai 6 ai 10 anni che vogliono provare la pallavolo.",
      date: "10 Maggio 2024",
      imageUrl: "https://picsum.photos/id/17/400/250"
    },
    {
      id: 3,
      title: "Nuovo Sponsor Tecnico",
      excerpt: "Siamo orgogliosi di annunciare la partnership con SportTime per la fornitura delle nuove divise ufficiali.",
      date: "05 Maggio 2024",
      imageUrl: "https://picsum.photos/id/20/400/250"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <Hero />

        {/* --- Società Info --- */}
        <Section id="societa" title="La Società" bgColor="bg-white">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                La <strong>Libertas Borgo Volley</strong> rappresenta con orgoglio la città di Borgo San Dalmazzo sui campi di tutta la provincia e regione.
                Fondata con l'obiettivo di promuovere lo sport come momento di aggregazione e crescita, oggi contiamo centinaia di tesserati.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                I nostri colori, il <strong>Bianco</strong> e il <strong>Blu</strong>, sono simbolo della nostra tenacia e della nostra trasparenza. Crediamo nel talento dei giovani e lavoriamo ogni giorno per costruire i campioni di domani, dentro e fuori dal campo.
              </p>
            </div>
            <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://picsum.photos/id/1059/800/600" alt="Team Libertas Borgo" className="w-full h-auto object-cover transform hover:scale-105 transition duration-500" />
            </div>
          </div>
        </Section>

        {/* --- Prossimo Match Banner --- */}
        <div id="risultati" className="bg-libertas-blue py-12 text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="font-display font-bold text-2xl mb-8 uppercase tracking-widest opacity-80">Prossimo Incontro</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl font-black mb-2">{match.homeTeam}</div>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block">CASA</div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-5xl font-black mb-2">VS</span>
                <span className="text-lg font-medium text-blue-200">{match.date}</span>
                <span className="text-sm text-blue-300 mt-1">{match.category}</span>
              </div>

              <div className="text-center">
                <div className="text-3xl font-black mb-2">{match.awayTeam}</div>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block">OSPITE</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Ultime Notizie --- */}
        <Section id="notizie" title="Notizie e Aggiornamenti" bgColor="bg-libertas-accent">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform hover:scale-110 transition duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="text-xs font-bold text-libertas-blue uppercase mb-2">{item.date}</div>
                  <h3 className="font-display font-bold text-xl mb-3 leading-tight">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">{item.excerpt}</p>
                  <a href="#" className="text-libertas-blue font-bold text-sm hover:underline mt-auto flex items-center">
                    Leggi tutto
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* --- Squadre Preview --- */}
        <Section id="squadre" title="Le Nostre Squadre" bgColor="bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teams.map((team) => (
              <div key={team.idteam} className="group relative rounded-xl overflow-hidden cursor-pointer h-40">
                <img src={getButtonBg()} alt={team.description} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-blue-900/60 group-hover:bg-blue-900/40 transition flex items-center justify-center">
                  <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-wider border-2 border-white px-4 py-2">{team.description}</h3>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* --- Sponsor --- */}
        <Section id="sponsor" title="I Nostri Sponsor" bgColor="bg-gray-50">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {partners.length > 0 ? (
              partners.map((partner) => (
                <div key={partner.idpartner} className="relative h-24 w-48 flex items-center justify-center rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 hover:grayscale">
                  <img
                    src={partner.logo ? getAssetPath(partner.logo) : getButtonBg()}
                    alt={partner.description}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallback = getButtonBg();
                      if (!target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-libertas-blue font-black text-lg uppercase tracking-wider border-2 border-white px-2 py-1 bg-white/90 backdrop-blur-sm rounded">{partner.description}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">Nessuno sponsor disponibile al momento.</div>
            )}
          </div>
        </Section>

      </main>

      <Footer />

    </div>
  );
};

export default Home;