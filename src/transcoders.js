import {CONFIG} from "./configuration.js";
import {extractFileName} from "./utils.js";

export const Transcoders = [
    {
        id: 'combine',
        label: 'Combine files',
        selected: true,
        command: `[vlc] [input_files] vlc://quit 
                       --sout "#transcode{vcodec=H264,venc{profile=veryfast,level=40},vfilter=canvas{width=1280,height=720,aspect=16:9},width=1280,height=720,fps=60,vb=8000,acodec=none}:std{access=file,mux=ts,dst=-}" 
                       --ignore-config |
                       ffmpeg -i - -c copy -y [output_folder]concatenated_video.ts`.replace(/[\r\n\t]+| +/g, ' ').trim(),
        prepareCommands: function(mediaFiles, $this) {
            let cmd = $this.command;
            cmd = cmd.replaceAll('[vlc]', CONFIG.media.vlcExecutable);
            cmd = cmd.replaceAll('[output_folder]', CONFIG.media.processedInputFolder);

            let files = '';
            mediaFiles.forEach(mediaFile => {
                files = `"${mediaFile.absolutePath}" ${files}`;
            });

            cmd = cmd.replaceAll('[input_files]', files);
            return [cmd];
        }
    },
    {
        id: 'transcodeV1',
        label: 'Transcode One by One to TS',
        selected: false,
        command: `ffmpeg -i [input_file] -vcodec libx264 -an -y "[output_folder][output_file].ts"`.replace(/[\r\n\t]+| +/g, ' ').trim(),
        prepareCommands: function(mediaFiles, $this) {
            let commands = [];

            mediaFiles.forEach(mediaFile => {
                const inputFileName = extractFileName(mediaFile.absolutePath);
                let cmd = $this.command;
                cmd = cmd.replaceAll('[output_folder]', CONFIG.media.processedInputFolder);
                cmd = cmd.replaceAll('[input_file]', `"${mediaFile.absolutePath}"`);
                cmd = cmd.replaceAll('[output_file]', inputFileName);

                commands.push(cmd);
            });

            return commands;
        }
    }
]

export const TranscodersMap = {};
Transcoders.forEach(obj => {
    TranscodersMap[obj.id] = obj;
});
