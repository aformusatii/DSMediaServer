FROM node:20

RUN apt-get update \
&& apt-get install -y vlc ffmpeg net-tools

WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE 3000
EXPOSE 3001
EXPOSE 8080

CMD [ "node", "src/server.js" ]