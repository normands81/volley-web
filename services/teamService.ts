import { supabase } from './supabaseClient';
import { Team } from '../types';

export const getTeams = async (): Promise<Team[]> => {
    try {
        const { data, error } = await supabase
            .from('TbTeams')
            .select(`
        *,
        TbSeasons!inner(current)
      `)
            .eq('TbSeasons.current', true);

        if (error) {
            console.error('Error fetching teams:', error);
            return [];
        }

        return data as Team[] || [];
    } catch (err) {
        console.error('Unexpected error fetching teams:', err);
        return [];
    }
};
