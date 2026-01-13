import React from 'react';
import {
    Users,
    Shield,
    Newspaper,
    Calendar,
    ArrowRight,
    Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, count, subtitle, icon, buttonText, buttonColor, onClick }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
        <div className="mb-4 text-slate-400 bg-slate-50 p-3 rounded-full">
            {icon}
        </div>
        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide mb-1">{title}</h3>
        <p className="text-4xl font-bold text-slate-800 mb-2">{count}</p>
        <span className="text-xs text-slate-400 mb-6">{subtitle}</span>

        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 ${buttonColor}`}
        >
            <span>{buttonText}</span>
            <ArrowRight size={16} />
        </button>
    </div>
);

import { supabase } from '../services/supabaseClient';

const Dashboard: React.FC = () => {
    const [teamsCount, setTeamsCount] = React.useState<number | null>(null);
    const [partnersCount, setPartnersCount] = React.useState<number | null>(null);
    const [newsCount, setNewsCount] = React.useState<number | null>(null);
    const [athletesCount, setAthletesCount] = React.useState<number | null>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Get the current active season
                const { data: seasonData, error: seasonError } = await supabase
                    .from('TbSeasons')
                    .select('idseason')
                    .eq('active', true)
                    .eq('current', true)
                    .single();

                if (seasonError) {
                    console.error('Error fetching active season:', seasonError);
                    return;
                }

                if (seasonData) {
                    // 2. Count teams for this season
                    const { count: teamCount, error: teamError } = await supabase
                        .from('TbTeams')
                        .select('*', { count: 'exact', head: true })
                        .eq('idseason', seasonData.idseason);

                    if (teamError) {
                        console.error('Error counting teams:', teamError);
                    } else {
                        setTeamsCount(teamCount);
                    }

                    // 3. Count partners for this season
                    const { count: partnerCount, error: partnerError } = await supabase
                        .from('TbPartners')
                        .select('*', { count: 'exact', head: true })
                        .eq('idseason', seasonData.idseason);

                    if (partnerError) {
                        console.error('Error counting partners:', partnerError);
                    } else {
                        setPartnersCount(partnerCount);
                    }

                    // 4. Count news for this season
                    const { count: newsCount, error: newsError } = await supabase
                        .from('TbNews')
                        .select('*', { count: 'exact', head: true })
                        .eq('idseason', seasonData.idseason);

                    if (newsError) {
                        console.error('Error counting news:', newsError);
                    } else {
                        setNewsCount(newsCount);
                    }

                    // 5. Count athletes for this season
                    const { count: athleteCount, error: athleteError } = await supabase
                        .from('TbTeamsMembers')
                        .select('*', { count: 'exact', head: true })
                        .eq('idseason', seasonData.idseason);

                    if (athleteError) {
                        console.error('Error counting athletes:', athleteError);
                    } else {
                        setAthletesCount(athleteCount);
                    }
                }
            } catch (err) {
                console.error('Unexpected error fetching dashboard stats:', err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 font-display">Dashboard</h1>
                <p className="text-slate-500 text-sm">Benvenuto nel pannello di controllo.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Squadre"
                    count={teamsCount !== null ? teamsCount.toString() : "-"}
                    subtitle="Totale attive"
                    icon={<Shield size={24} />}
                    buttonText="Gestisci"
                    buttonColor="bg-green-500"
                    onClick={() => navigate('/backend/squadre')}
                />
                <StatCard
                    title="Sponsor"
                    count={partnersCount !== null ? partnersCount.toString() : "-"}
                    subtitle="Sponsor totali"
                    icon={<Users size={24} />}
                    buttonText="Gestisci"
                    buttonColor="bg-orange-500"
                />
                <StatCard
                    title="News"
                    count={newsCount !== null ? newsCount.toString() : "-"}
                    subtitle="Articoli pubblicati"
                    icon={<Newspaper size={24} />}
                    buttonText="Gestisci"
                    buttonColor="bg-blue-500"
                />
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Athletes */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <StatCard
                        title="Atleti"
                        count={teamsCount !== null ? teamsCount.toString() : "-"}
                        subtitle="Totale attivi"
                        icon={<Shield size={24} />}
                        buttonText="Gestisci"
                        buttonColor="bg-yellow-500"
                        onClick={() => navigate('/backend/atleti')}
                    />
                </div>

                {/* Chart Widget (Simplistic implementation) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 self-start">Stato Certificati</h3>
                    <div className="relative w-40 h-40 rounded-full border-[12px] border-slate-100 flex items-center justify-center border-t-blue-500 border-r-blue-500 rotate-45">
                        {/* CSS trick for donut chart */}
                        <div className="absolute inset-0 rounded-full border-[12px] border-transparent border-l-blue-200 -rotate-90"></div>
                        <span className="text-3xl font-bold text-blue-600 -rotate-45">75%</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-6 text-xs text-slate-500">
                        <div className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> In regola</div>
                        <div className="flex items-center"><span className="w-2 h-2 bg-slate-200 rounded-full mr-1"></span> In Scadenza</div>
                    </div>
                </div>

                {/* Utility Widget */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Bozze News</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-slate-100 transition-colors">
                            <Calendar size={18} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Nuovo Campo in Arrivo!</p>
                                <p className="text-xs text-slate-400 mt-1">Modificato 2 ore fa</p>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg flex items-start space-x-3 cursor-pointer hover:bg-slate-100 transition-colors">
                            <Edit3 size={18} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Intervista al Coach Rosai 🔴</p>
                                <p className="text-xs text-slate-400 mt-1">Bozza automatica</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
