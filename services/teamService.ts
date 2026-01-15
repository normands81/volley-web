import { supabase } from './supabaseClient';
import { Team } from '../types';

export const getTeams = async (): Promise<Team[]> => {
    try {
        const { data, error } = await supabase
            .from('vw_teams_list')
            .select('*')
            .eq('current', true);

        if (error) {
            console.error('Error fetching teams:', error);
            return [];
        }

        return (data || []).map((t: any) => ({
            idteam: t.idteam,
            description: t.team_name,
            idseason: t.idseason,
            photo: t.photo || null
        })) as Team[];
    } catch (err) {
        console.error('Unexpected error fetching teams:', err);
        return [];
    }
};
