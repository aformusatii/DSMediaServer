export const COMMANDS = {

    CONCAT_VIDEO_V1: `[vlc] [input_files] vlc://quit 
                       --sout "#transcode{vcodec=H264,venc{profile=veryfast,level=40},vfilter=canvas{width=1280,height=720,aspect=16:9},width=1280,height=720,fps=60,vb=8000,acodec=none}:std{access=file,mux=ts,dst=-}" 
                       --ignore-config |
                       ffmpeg -i - -c copy -y [output_folder]concatenated_video.ts`.replace(/[\r\n\t]+| +/g, ' ').trim()

}