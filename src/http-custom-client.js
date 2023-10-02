import http from "http";
import {parseUri} from './utils.js';

const DEFAULT_TIMEOUT = 10000;

export default class HttpCustomClient {

    sendRequest(options, reqBody) {
        const _this = this;

        const parsedUri = parseUri(options.url);

        const httpOptions = {
            hostname: parsedUri.hostname,
            port: parsedUri.port,
            path: parsedUri.path,
            method: options.method,
            headers: options.headers,
            timeout: DEFAULT_TIMEOUT
        }

        if (reqBody) {
            httpOptions.headers['Content-Length'] = reqBody.length;
        }

        return new Promise((resolve, reject) => {
            _this.req = http.request(httpOptions, (res) => {
                //console.log(`STATUS: ${res.statusCode}`);
                //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: chunk
                    });

                    res.connection.end();
                });

                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers
                    });
                });
            });

            _this.req.on("error", err => {
                reject(err);
            });

            _this.req.on("timeout", () => {
                reject('Connection timeout');
                _this.req.connection.end();
            });

            if (reqBody) {
                _this.req.write(reqBody, err => {
                    if (err) {
                        reject(err);
                    }
                });
            }

            _this.req.end();
        });
    }
}

/* const test = async function() {
    const client = new CustomHttpClient();
    const result = await client.sendRequest({
        method: 'SUBSCRIBE',
        url: 'http://192.168.100.109:5000/path',
        headers: {
            'Content-Type': 'application/json'
        },
    }, 'body');

    console.log('result', result);
}

test(); */