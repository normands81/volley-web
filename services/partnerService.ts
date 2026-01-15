import { supabase } from './supabaseClient';
import { Partner } from '../types';

export const getPartners = async (): Promise<Partner[]> => {
    try {
        const { data, error } = await supabase
            .from('vw_partners_list')
            .select('*')
            .eq('active', true)
            .eq('current', true);

        if (error) {
            console.error('Error fetching partners:', error);
            return [];
        }

        return (data || []).map((p: any) => ({
            idpartner: p.idpartner,
            description: p.partner_description, // Map from view column
            logo: p.logo,
            active: p.active,
            idseason: p.idseason
        })) as Partner[];
    } catch (err) {
        console.error('Unexpected error fetching partners:', err);
        return [];
    }
};
