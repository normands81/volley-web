
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwccljsfbvkejnrdjjqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y2NsanNmYnZrZWpucmRqanFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjQzOTAsImV4cCI6MjA4MDMwMDM5MH0.gLlhE_i1o6YOp6Q494lFh8h5N5dTBHsBZzMMJJJPq8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    // 1. Get a team
    const { data: teams, error: teamsError } = await supabase
        .from('TbTeams')
        .select('idteam')
        .limit(1);

    if (teamsError || !teams || teams.length === 0) {
        console.error('Error fetching team or no teams found:', teamsError);
        return;
    }

    const idteam = teams[0].idteam;
    console.log('Using idteam:', idteam);

    // 2. Try insert
    const payload = {
        idteam: idteam,
        opponent: 'Test Opponent',
        match_date: '2025-01-01',
        match_time: '10:00',
        match_location: 'Test Location',
        match_id: 'TEST001'
    };

    console.log('Inserting payload:', payload);

    const { data, error } = await supabase
        .from('TbCalendars')
        .insert([payload])
        .select();

    if (error) {
        console.error('Insert error:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
    } else {
        console.log('Insert successful:', data);
        // Clean up
        const { error: deleteError } = await supabase
            .from('TbCalendars')
            .delete()
            .eq('match_id', 'TEST001');
        if (deleteError) console.error('Cleanup error:', deleteError);
    }
}

testInsert();
