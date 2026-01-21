
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwccljsfbvkejnrdjjqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y2NsanNmYnZrZWpucmRqanFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjQzOTAsImV4cCI6MjA4MDMwMDM5MH0.gLlhE_i1o6YOp6Q494lFh8h5N5dTBHsBZzMMJJJPq8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking TbCalendars...');
    const { data: calendars, error: calendarsError } = await supabase
        .from('TbCalendars')
        .select('*')
        .limit(1);

    if (calendarsError) {
        console.error('Error fetching TbCalendars:', calendarsError.message);
    } else {
        console.log('TbCalendars data:', calendars);
    }

    console.log('\nChecking TbMatches...');
    const { data: matches, error: matchesError } = await supabase
        .from('TbMatches')
        .select('*')
        .limit(1);

    if (matchesError) {
        console.error('Error fetching TbMatches:', matchesError.message);
    } else {
        console.log('TbMatches data:', matches);
    }
}

checkData();
