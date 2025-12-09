import { supabase } from './supabaseClient';
import { NewsItem } from '../types';

export const getNews = async (): Promise<NewsItem[]> => {
    try {
        const { data, error } = await supabase
            .from('TbNews')
            .select('*')
            .order('event_date', { ascending: false });

        if (error) {
            console.error('Error fetching news:', error);
            return [];
        }

        return data as NewsItem[] || [];
    } catch (err) {
        console.error('Unexpected error fetching news:', err);
        return [];
    }
};
