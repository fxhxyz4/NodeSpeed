FROM node:18-alpine

WORKDIR /app

COPY proxy/package*.json proxy/yarn.lock* ./

RUN yarn install --ignore-engines

COPY proxy/ .

COPY lib/ ../lib/
COPY src/ ../src/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "proxy.js"]