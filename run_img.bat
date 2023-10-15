rem docker run -it -d --rm --network host --name ds_mediaserver ds_mediaserver
docker run -it -d --rm -p 8080:8080 -p 3000:3000 -p 3001:3001 --name ds_mediaserver ds_mediaserver