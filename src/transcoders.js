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
                       ffmpeg -i - -c copy -y [output_folder][output_file]`.replace(/[\r\n\t]+| +/g, ' ').trim(),
        parameters: [
            {
                key: 'repeat',
                label: 'Repeat',
                type: 'number',
                value: 0
            },
            {
                key: 'output_file',
                label: 'Output File',
                type: 'text',
                value: 'concatenated_video.ts'
            }
        ],
        prepareCommands: function(mediaFiles, transcoder, transcoderParams) {
            let cmd = transcoder.command;
            cmd = cmd.replaceAll('[vlc]', CONFIG.media.vlcExecutable);
            cmd = cmd.replaceAll('[output_folder]', CONFIG.media.processedInputFolder);

            transcoderParams.forEach(param => {
                if (param.key === 'output_file') {
                    cmd = cmd.replaceAll('[output_file]', param.value);
                }
            });

            let files = '';
            mediaFiles.forEach(mediaFile => {
                files = `"${mediaFile.absolutePath}" ${files}`;
            });

            transcoderParams.forEach(param => {
                if (param.key === 'repeat' && (param.value > 0)) {
                    files = `${files.trim()} `;
                    files = files.repeat(param.value).trim();
                }
            });

            cmd = cmd.replaceAll('[input_files]', files);
            return [cmd];
        }
    },
    {
        id: 'transcodeV1',
        label: 'Transcode One by One to TS',
        selected: false,
        command: `ffmpeg -i [input_file] [output_format] -y "[output_folder][output_file].ts"`.replace(/[\r\n\t]+| +/g, ' ').trim(),
        parameters: [
            {
                key: 'output_format',
                label: 'Output Format',
                type: 'text',
                value: '-vcodec libx264 -an'
            }
        ],
        prepareCommands: function(mediaFiles, transcoder, transcoderParams) {
            let commands = [];

            mediaFiles.forEach(mediaFile => {
                const inputFileName = extractFileName(mediaFile.absolutePath);
                let cmd = transcoder.command;
                cmd = cmd.replaceAll('[output_folder]', CONFIG.media.processedInputFolder);
                cmd = cmd.replaceAll('[input_file]', `"${mediaFile.absolutePath}"`);
                cmd = cmd.replaceAll('[output_file]', inputFileName);

                transcoderParams.forEach(param => {
                    if (param.key === 'output_format') {
                        cmd = cmd.replaceAll('[output_format]', param.value);
                    }
                });

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
