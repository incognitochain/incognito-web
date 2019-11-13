FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY run.sh /usr/share/nginx/html
COPY robots.txt /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

COPY incognito.org.crt /etc/tls/incognito.org.crt
COPY incognito.org.key /etc/tls/incognito.org.key
COPY incognito.org.pass /etc/tls/incognito.org.pass
