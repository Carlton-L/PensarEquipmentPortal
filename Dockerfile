# works with:
# docker build -t node-app .   
# docker tag node-app equipmentportalcontainer.azurecr.io/node-app
# docker push equipmentportalcontainer.azurecr.io/node-app     

FROM --platform=linux/amd64 node:16-stretch
COPY --chown=node:node package.json package-lock.json /app/
WORKDIR /app
RUN npm install
COPY --chown=node:node . /app/
EXPOSE 80
ENTRYPOINT ["node", "server.js"]