FROM node:20

RUN apt-get update \
&& apt-get install -y vlc ffmpeg

WORKDIR /usr/src/app

COPY . .
RUN npm install
COPY --chown=node:node .run  .

EXPOSE 3000
EXPOSE 3001
EXPOSE 8080

CMD [ "node", "src/server.js" ]