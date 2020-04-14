FROM node:10.16.3-slim AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.17-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
