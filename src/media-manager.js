import {CONFIG} from './configuration.js';
import fs from 'fs';
import path from 'path';
import ChildProcess from "./child-process.js";
import {COMMANDS} from "./commands.js";
import {EVENTS} from "./constants.js";
import {copyFileAsync, deleteFileAsync, objToStr} from "./utils.js";

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
                await copyFileAsync(mediaFile.absolutePath, CONFIG.media.processedInputFolder);
            }
        }
    }

    async delete(mediaFiles) {
        for (const mediaFile of mediaFiles) {
            if (mediaFile.selected) {
                console.log('Delete file.', objToStr(mediaFile));
                await deleteFileAsync(mediaFile.absolutePath);
            }
        }
    }

    async convert(mediaFiles) {
        let cmd = COMMANDS.CONCAT_VIDEO_V1;
        cmd = cmd.replaceAll('[vlc]', CONFIG.media.vlcExecutable);
        cmd = cmd.replaceAll('[output_folder]', CONFIG.media.processedInputFolder);

        let files = '';
        mediaFiles.forEach(mediaFile => {
            if (mediaFile.selected) {
                files = `"${mediaFile.absolutePath}" ${files}`;
            }
        });

        cmd = cmd.replaceAll('[input_files]', files);
        console.log('cmd', cmd);

        try {
            await this.childProcess.execute(cmd);
        } catch(exception) {
            console.log('Exception while converting video', exception);
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
            const files = fs.readdirSync(directoryPath);

            files.forEach((fileName) => {
                const file = {
                    name: fileName,
                    absolutePath: path.join(directoryPath, fileName)
                }

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