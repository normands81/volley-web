import { supabase } from './supabaseClient';
import { Partner } from '../types';

export const getPartners = async (): Promise<Partner[]> => {
    try {
        const { data, error } = await supabase
            .from('TbPartners')
            .select(`
        *,
        TbSeasons!inner(current)
      `)
            .eq('active', true)
            .eq('TbSeasons.current', true);

        if (error) {
            console.error('Error fetching partners:', error);
            return [];
        }

        return data as Partner[] || [];
    } catch (err) {
        console.error('Unexpected error fetching partners:', err);
        return [];
    }
};
