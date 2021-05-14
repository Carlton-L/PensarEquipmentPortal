FROM node:16-stretch
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package.json package-lock.json ./
RUN npm install
COPY --chown=node:node . .
# CMD ["node", "server.js"]