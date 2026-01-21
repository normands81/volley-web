
const https = require('https');

const projectRef = 'kwccljsfbvkejnrdjjqq';
const token = 'sbp_503b89c4ec0fcdb224103adb831719efd5c2feb8';

const postData = JSON.stringify({
    query: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'TbCalendars';"
});

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': postData.length
    }
};

const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    let data = '';

    res.on('data', (d) => {
        data += d;
    });

    res.on('end', () => {
        console.log('Response body:');
        console.log(data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(postData);
req.end();
