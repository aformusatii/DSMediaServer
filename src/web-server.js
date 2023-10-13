import {CONFIG, RAW_CONFIG, saveRawConfig} from './configuration.js';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, CONFIG.media.rawInputFolder)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage})

// Fix for __dirname is not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.text());

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

const getVideoFiles = async function(req, res) {
    appContext.mediaManager.scanFiles();
    res.json({
        ok: true,
        rawInputFiles: appContext.mediaManager.rawInputFiles,
        processedInputFiles: appContext.mediaManager.processedInputFiles
    });
}

const videoFilesExecuteAction = async function(req, res) {
    switch (req.body.action) {
        case 'delete':
            await appContext.mediaManager.delete(req.body.mediaFiles);
            break;

        case 'copy':
            await appContext.mediaManager.copy(req.body.mediaFiles);
            break;

        case 'convert':
            await appContext.mediaManager.convert(req.body.mediaFiles);
            break;
    }

    res.json({
        ok: true
    });
}

const uploadVideoFile = async function(req, res) {

    console.log('req.file', req.file);

    res.json({
        status: 'ok',
        path: 'path'
    });
}

const deleteVideoFiles = async function(req, res) {
    await appContext.deviceManager.deleteDevice(req.params.deviceKey);

    res.json({
        ok: true
    });
}

const getScheduler = async function(req, res) {
    const data = appContext.scheduler.getData();
    res.json(data);
}

const updateScheduler = async function(req, res) {
    appContext.scheduler.update(req.body);

    res.json({
        ok: true
    });
}

const getConfiguration = async function(req, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(RAW_CONFIG);
}

const saveConfiguration = async function(req, res) {
    console.log('Update configuration.');
    saveRawConfig(req.body);

    res.json({
        ok: true
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
    app.delete('/devices/:deviceKey', deleteVideoFiles);

    app.get('/scheduler', getScheduler);
    app.post('/scheduler', updateScheduler);

    app.get('/videos', getVideoFiles);
    app.post('/videos/upload', upload.any(), uploadVideoFile);
    app.post('/videos/do', videoFilesExecuteAction);

    app.get('/configuration', getConfiguration);
    app.post('/configuration', saveConfiguration);

    /* ============================================================ */
    /* Server setup */
    /* ============================================================ */
    const PORT = CONFIG.webServer.port;
    app.listen(PORT, () => console.log(`Web Server listening on port: ${PORT}`));
}
