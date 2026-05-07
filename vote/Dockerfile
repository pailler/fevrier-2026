FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY public ./public

ENV VOTE_PORT=7890
EXPOSE 7890

CMD ["npm", "start"]
