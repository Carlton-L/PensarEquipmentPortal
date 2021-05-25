FROM --platform=linux/amd64 node:16-stretch
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
EXPOSE 80
CMD ["node", "api/src/server.js"]
