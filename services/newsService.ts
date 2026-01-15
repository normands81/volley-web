import { supabase } from './supabaseClient';
import { NewsItem } from '../types';

export const getNews = async (): Promise<NewsItem[]> => {
    try {
        const { data, error } = await supabase
            .from('vw_news_list')
            .select('*')
            .order('event_date', { ascending: false })
            .limit(3); // Limit to 3 items as it is for homepage

        if (error) {
            console.error('Error fetching news:', error);
            return [];
        }

        return (data || []).map((n: any) => ({
            idnews: n.idnews,
            title: n.title,
            description: n.news_description,
            image: n.image,
            event_date: n.event_date,
            idseason: n.idseason,
            idteam: n.idteam,
            updated_at: n.updated_at
        })) as NewsItem[];
    } catch (err) {
        console.error('Unexpected error fetching news:', err);
        return [];
    }
};

export const getNewsById = async (id: number): Promise<NewsItem | null> => {
    try {
        const { data, error } = await supabase
            .from('TbNews')
            .select('*')
            .eq('idnews', id)
            .single();

        if (error) {
            console.error('Error fetching news details:', error);
            return null;
        }

        return data as NewsItem;
    } catch (err) {
        console.error('Unexpected error fetching news details:', err);
        return null;
    }
};
