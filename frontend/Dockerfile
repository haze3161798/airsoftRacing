FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NITRO_PRESET=node-server
ENV NUXT_PUBLIC_API_BASE=https://airsoftracingbackend.zeabur.app/api

RUN npm run build

# Fix: Nitro resolves static assets relative to server/chunks/_/
# but expects them at server/chunks/public/ — create symlink
RUN ln -s /app/.output/public /app/.output/server/chunks/public

ENV NITRO_PORT=8080
ENV NITRO_HOST=0.0.0.0

EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]
