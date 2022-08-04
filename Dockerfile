# Use Alpine and install Node.js which is 50% smaller than the -alpine version of the node
# image (53 MB including the faucet app).
FROM alpine:3.15 as build-env
# Installs Node.js 16 (https://pkgs.alpinelinux.org/packages?name=nodejs&branch=v3.15)

RUN apk add --update nodejs
RUN apk add --update npm
RUN apk add --update ca-certificates jq bash curl

WORKDIR /home/faucet/
COPY . .

RUN npm install

EXPOSE 5000
