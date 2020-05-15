FROM node:10.16.3-slim AS builder

ARG CONF_ENV

WORKDIR /app

RUN echo -n "$CONF_ENV" | base64 -d > .env

COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.17-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
