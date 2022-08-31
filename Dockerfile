FROM node:latest

WORKDIR /app

COPY . .

RUN npm install
RUN npm install pm2 -g

CMD ["pm2-runtime", "pm2.json"]