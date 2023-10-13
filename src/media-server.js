import {CONFIG} from './configuration.js';
import express from 'express';
import fs from "fs";
import {EVENTS} from './constants.js';
import {isNotSet} from "./utils.js";

const app = express();

let mediaFilesMap = {};

const headMediaFile = async function(req, res) {
    console.log('HEAD Media', req.params);

    const file = mediaFilesMap[req.params.mediaId];
    if (isNotSet(file)) {
        console.log('HEAD', req.params.deviceId, 'File not found:', req.params.mediaId);
        res.status(404).end();
        return;
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-type': 'application/octet-stream',
        'Pragma': 'no-cache',
        'Accept-Ranges': 'none',
        'Transfer-Encoding' : 'chunked',
        'Connection': 'close'
    })

    res.end();
}

const getMediaFile = async function(req, res) {
    console.log('GET Media', req.params);

    const file = mediaFilesMap[req.params.mediaId];
    if (isNotSet(file)) {
        console.log('GET', req.params.deviceId, 'File not found:', req.params.mediaId);
        res.status(404).send('404 - File Not Found');
        return;
    }

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-type': 'application/octet-stream',
        'Pragma': 'no-cache',
        'Accept-Ranges': 'none',
        'Connection': 'close'
    });

    const filePath = file.absolutePath;
    //const filePath = 'C:\\Development\\repository\\IDSSMediaServer\\ffmpeg\\tmp\\video1.ts';
    //const filePath = 'C:\\temp\\video_conversion\\out.ts';

    const CHUNK_SIZE = 1048576;

    fs.open(filePath, 'r', function(status, fd) {
        if (status) {
            console.error(status);
            return;
        }

        let buffer = new Uint8Array(CHUNK_SIZE);
        let bytesRead;

        // Read chunks of data from the file until there is no more data
        while ((bytesRead = fs.readSync(fd, buffer, 0, buffer.length)) !== 0) {
            // Process the chunk of data
            res.write(buffer.slice(0, bytesRead), undefined, null);
        }

        res.end();

        // Close the file
        fs.closeSync(fd);
    });
}

const onUpdateMediaFiles = function(files) {
    mediaFilesMap = {};

    files.forEach(file => {
        mediaFilesMap[file.key] = file;
    });
}

export function setupServer(appContext) {
    appContext.eventBus.on(EVENTS.MEDIA_FILES_UPDATE, onUpdateMediaFiles);

    /* ============================================================ */
    /* HTTP Handlers */
    /* ============================================================ */
    app.get('/media/:deviceId/:mediaId', getMediaFile);
    app.head('/media/:deviceId/:mediaId', headMediaFile);

    /* ============================================================ */
    /* Server setup */
    /* ============================================================ */
    app.set('etag', false);
    app.disable('x-powered-by');
    app.disable('Connection');

    const PORT = CONFIG.mediaFileServer.port;
    app.listen(PORT, () => console.log(`Media Server listening on port: ${PORT}`));
}
