#FROM nikolaik/python-nodejs:latest as bundler
FROM node:latest as bundler
RUN curl "https://install.meteor.com/" | sh
ENV METEOR_ALLOW_SUPERUSER=1

FROM bundler as build
ADD . /app
WORKDIR /app
RUN chmod -R 700 /app/.meteor
RUN meteor npm install 
RUN npm install node-fetch
RUN npm install http
RUN meteor build --server-only --allow-superuser --directory /bundle

FROM node:12-alpine as rebuilder
#RUN adduser -u 501 --home /home/meteor meteor
#RUN chown -Rh meteor .meteor/local
COPY --from=build /bundle /rebuild
WORKDIR /rebuild/bundle/programs/server
RUN npm install 
RUN npm install node-fetch
RUN npm install http

#FROM node:12-alpine as runtime
#RUN adduser -D -u 501 -h /home/meteor meteor
#COPY --from=rebuilder /rebuild/bundle /webapp
#WORKDIR /webapp

#ENV MONGO_URL="mongodb://pharmtaxi:meteor@mongodb.socmedica.com:27027/PHTForSLF?authSource=admin&replicaSet=prod&readPreference=secondaryPreferred&ssl=false"
#ENV ROOT_URL="http://service.socmedica.com"
#ENV PORT=3000
#ENV NODE_ENV="production"
#EXPOSE 3000
#USER meteor
#CMD node main.js

#FROM mongo as runtime
FROM node:12-bullseye as runtime
RUN apt-get clean
RUN apt-get -y --allow-unauthenticated --allow-insecure-repositories update
RUN apt-get upgrade -y
RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
#RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
RUN curl -fsSL https://pgp.mongodb.com/server-5.0.asc | gpg -o /usr/share/keyrings/mongodb-server-5.0.gpg --dearmor
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-5.0.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/5.0 main" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
#RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
RUN apt-get update
RUN apt-get install -y mongodb-org=5.0.20 mongodb-org-database=5.0.20 mongodb-org-server=5.0.20 mongodb-org-shell=5.0.20 mongodb-org-mongos=5.0.20 mongodb-org-tools=5.0.20
#RUN apt-get install -y mongodb-org=5.0.5 mongodb-org-database=5.0.5 mongodb-org-server=5.0.5 mongodb-mongosh=5.0.5 mongodb-org-mongos=5.0.5 mongodb-org-tools=5.0.5
RUN node -v
RUN npm --version
RUN mongo --version
RUN npm install node-fetch
RUN npm install http
RUN useradd -u 501 -d /home/meteor meteor -p ''
#RUN chown -Rh meteor .meteor/local
COPY --from=rebuilder /rebuild/bundle /webapp
WORKDIR /webapp
ENV MONGO_URL="mongodb://pharmtaxi:meteor@mongodb.socmedica.com:27027/PHTForSLF?authSource=admin&directConnection=false&replicaSet=prod&readPreference=secondaryPreferred&ssl=false"
ENV ROOT_URL="http://service.socmedica.com"
ENV PORT=3000
ENV NODE_ENV="production"
EXPOSE 3000
USER meteor
CMD node main.js

