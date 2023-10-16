import {CONFIG} from './configuration.js';
import fs from 'fs';
import path from 'path';
import ChildProcess from "./child-process.js";
import {EVENTS} from "./constants.js";
import {copyFileAsync, deleteFileAsync, objToStr, resolveToAbsolutePath} from "./utils.js";
import {TranscodersMap} from "./transcoders.js";

export default class MediaManager {

    constructor(appContext) {
        this.appContext = appContext;
        this.rawInputFiles = [];
        this.processedInputFiles = [];
        this.processedInputFilesHash = null;
        this.childProcess = new ChildProcess();
    }

    async copy(mediaFiles) {
        for (const mediaFile of mediaFiles) {
            if (mediaFile.selected) {
                console.log('Copy file.', objToStr(mediaFile));
                try {
                    await copyFileAsync(mediaFile.absolutePath, resolveToAbsolutePath(CONFIG.media.processedInputFolder));
                } catch (exception) {
                    console.log('Exception while copying file.', exception);
                }
            }
        }
    }

    async delete(mediaFiles) {
        for (const mediaFile of mediaFiles) {
            if (mediaFile.selected) {
                console.log('Delete file.', objToStr(mediaFile));
                try {
                    await deleteFileAsync(mediaFile.absolutePath);
                } catch (exception) {
                    console.log('Exception while deleting file.', exception);
                }
            }
        }
    }

    async transcode(mediaFiles, transcoderId, transcoderParams) {
        const transcoder = TranscodersMap[transcoderId];
        let commands = transcoder.prepareCommands(mediaFiles, transcoder, transcoderParams);

        try {
            for (const command of commands) {
                await this.childProcess.execute(command);
            }
            return {
                ok: true
            };
        } catch(exception) {
            console.log('Exception while converting video', exception);
            return {
                ok: false,
                exception: exception
            };
        }
    }

    scanFiles() {
        this.rawInputFiles = this._scanFolder(CONFIG.media.rawInputFolder);
        this.processedInputFiles = this._scanFolder(CONFIG.media.processedInputFolder);

        this.processedInputFiles.forEach((file, index) => {
            file.key = `video_${index}.mpg`;
        });

        const filesHash = this._filesHash(this.processedInputFiles);
        if (filesHash !== this.processedInputFilesHash) {
            this.appContext.eventBus.emit(EVENTS.MEDIA_FILES_UPDATE, this.processedInputFiles);
        }

        this.processedInputFilesHash = filesHash;
    }

    _scanFolder(directoryPath) {
        const outFiles = [];

        try {
            const absoluteDirPath = resolveToAbsolutePath(directoryPath);
            console.log(`Scan folder [${absoluteDirPath}] for media files.`);

            const files = fs.readdirSync(absoluteDirPath);

            files.forEach((fileName) => {
                const file = {
                    name: fileName,
                    absolutePath: path.join(absoluteDirPath, fileName)
                }

                console.log('-> Found media file:', objToStr(file));

                outFiles.push(file);
            });

        } catch (err) {
            console.error(`Error reading directory [${directoryPath}]:`, err);
        }

        outFiles.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        return outFiles;
    }

    _filesHash(files) {
        let hash = '';
        files.forEach(file => {
            hash = `${hash}-${file.absolutePath}`;
        });

        return hash;
    }

}