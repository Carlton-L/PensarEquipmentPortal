FROM node:16-stretch
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package.json package-lock.json ./
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000
ENTRYPOINT ["node", "server.js"]