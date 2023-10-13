import {CONFIG} from './configuration.js';
import express from 'express';
import {parseNotify} from './upnp-xml-parser.js';
import {EVENTS} from "./constants.js";

const app = express();
let appContext = null;

app.use(express.raw({type: '*/*'}));

app.all('/notify/:deviceKey', async function (req, res) {
    // console.log('NOTIFY: ', req.params.deviceKey, req.headers, req.body.toString());
    appContext.eventBus.emit(EVENTS.UPNP_NOTIFICATION, {
        deviceKey: req.params.deviceKey,
        headers: req.headers,
        payload: parseNotify(String(req.body))
    });

    res.removeHeader('Connection');
    res.removeHeader('Date');
    res.end();
});

export function setupServer(_appContext) {
    const PORT = CONFIG.notificationServer.port;
    appContext = _appContext;

    app.set('etag', false);
    app.disable('x-powered-by');

    app.listen(PORT, function (err) {
        if (err) {
            console.log('Error initializing Notification Server', err);
        } else {
            console.log(`Notification Server listening on port: ${PORT}`);
        }
    });
}