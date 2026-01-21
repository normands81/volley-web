
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwccljsfbvkejnrdjjqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y2NsanNmYnZrZWpucmRqanFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjQzOTAsImV4cCI6MjA4MDMwMDM5MH0.gLlhE_i1o6YOp6Q494lFh8h5N5dTBHsBZzMMJJJPq8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking information_schema for TbCalendars...');

    // Supabase JS client doesn't support querying information_schema directly via .from() usually, 
    // but sometimes it's exposed or we can use a stored procedure.
    // However, if we can't do that, we can try to inspect the error message from a bad insert 
    // or just rely on the user. 
    // Let's try the RPC approach if available, otherwise just try to select * again and check if we get ANY data.

    // Alternative: Try to select from a view that might have the columns. vw_calendars_list
    console.log('Checking vw_calendars_list structure...');
    const { data: viewData, error: viewError } = await supabase
        .from('vw_calendars_list')
        .select('*')
        .limit(1);

    if (viewData && viewData.length > 0) {
        console.log('Columns in vw_calendars_list:', Object.keys(viewData[0]));
    } else {
        console.log('No data in vw_calendars_list or error:', viewError);
    }
}

checkSchema();
