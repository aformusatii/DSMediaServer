import got from 'got';
import http from 'http';

//const response = await got.subscribe('192.168.100.109:5000');
//console.log('response: ', response.body);

const options = {
    hostname: '192.168.100.109',
    port: 5000,
    path: '/events.xml',
    method: 'SUBSCRIBE',
    headers: {
        'Content-Type': 'application/json'
    },
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.write('some data');