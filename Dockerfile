# Build Stage
FROM node:16-stretch AS build
WORKDIR /build
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
EXPOSE 80
CMD ["node", "-r", "dotenv/config", "api/src/server.js"]
#CMD ["npm",  "run", "server"]