
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwccljsfbvkejnrdjjqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y2NsanNmYnZrZWpucmRqanFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjQzOTAsImV4cCI6MjA4MDMwMDM5MH0.gLlhE_i1o6YOp6Q494lFh8h5N5dTBHsBZzMMJJJPq8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking TbSeasons...');
    const { data: seasons, error: seasonsError } = await supabase
        .from('TbSeasons')
        .select('*');

    if (seasonsError) {
        console.error('Error fetching seasons:', seasonsError);
    } else {
        console.log('Seasons:', seasons);
    }

    console.log('\nChecking vw_teams_list...');
    const { data: teams, error: teamsError } = await supabase
        .from('vw_teams_list')
        .select('*')
        .limit(1);

    if (teamsError) {
        console.error('Error fetching teams:', teamsError);
    } else {
        console.log('Teams:', teams);
    }
}

checkData();
