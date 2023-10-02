import CONFIG from './config.cjs'
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

// Fix for __dirname is not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

let appContext = null;

const startScanning = async function(req, res) {
    appContext.deviceDiscovery.scan();

    res.json({
        ok: true
    });
};

const sendWakeOnLan = async function(req, res) {
    appContext.deviceManager.sendWakeOnLanAll();

    res.json({
        ok: true
    });
};

const getDevices = async function(req, res) {
    const devices = appContext.deviceManager.getDevicesAsList();

    const webDevices = [];
    devices.forEach((device) => {
        const webDevice = device.data;
        webDevices.push(webDevice);
    })

    res.json(webDevices);
};

const updateDevice = async function(req, res) {
    await appContext.deviceManager.updateDeviceData(req.params.deviceKey, req.body);

    res.json({
        ok: true
    });
};

const setPlayback = async function(req, res) {
    appContext.deviceManager.setPlayback(req.body.play);

    res.json({
        ok: true,
        playing: appContext.deviceManager.isPlaying()
    });
};

const getPlayback = async function(req, res) {
    res.json({
        ok: true,
        playing: appContext.deviceManager.isPlaying()
    });
}

export function setupServer(_appContext) {
    /* ============================================================ */
    /* HTTP Handlers */
    /* ============================================================ */
    //app.get('/media/:deviceId/:mediaId', getMediaFile);
    //app.head('/media/:deviceId/:mediaId', headMediaFile);

    appContext = _appContext;

    const webFolder = path.join(__dirname, 'web', 'static');
    app.use(express.static(webFolder));

    app.post('/actions/scan', startScanning);
    app.post('/actions/sendWakeOnLan', sendWakeOnLan);
    app.post('/actions/playback', setPlayback);
    app.get('/actions/playback', getPlayback);

    app.get('/devices', getDevices);
    app.post('/devices/:deviceKey', updateDevice);

    /* ============================================================ */
    /* Server setup */
    /* ============================================================ */
    const PORT = CONFIG.webServer.port;
    app.listen(PORT, () => console.log(`Web Server listening on port: ${PORT}`));
}
