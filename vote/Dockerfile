FROM node:22-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

COPY server.js ./
COPY public ./public/

ENV NODE_ENV=production
ENV VOTE_PORT=7890

EXPOSE 7890

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf http://127.0.0.1:7890/health || exit 1

CMD ["node", "server.js"]
