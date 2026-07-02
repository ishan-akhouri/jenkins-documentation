FROM node:24-alpine3.23
WORKDIR /app
COPY package.json .
COPY app.js .
RUN rm -rf /usr/local/lib/node_modules/npm \
         /usr/local/lib/node_modules/corepack \
         /usr/local/bin/npm \
         /usr/local/bin/npx \
         /usr/local/bin/corepack
EXPOSE 3000
CMD ["node", "app.js"]
