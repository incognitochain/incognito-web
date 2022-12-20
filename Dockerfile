# build environment
FROM node:12 as build
ARG BUILD_ENV=staging

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY . ./

# https://create-react-app.dev/docs/adding-custom-environment-variables#what-other-env-files-can-be-used
COPY .env.${BUILD_ENV} .env.local
COPY .env.${BUILD_ENV} .env

RUN npm install
RUN npm run build

# production environment
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
# new
COPY etc/nginx/nginx-docker.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
