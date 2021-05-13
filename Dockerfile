FROM node:16-stretch
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

EXPOSE 8080
RUN npm install

CMD ["npm",  "run", "server"]