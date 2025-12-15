# Dockerfile for Strapi (blog-api)

FROM node:20-alpine AS opt

# Install system dependencies (for better-sqlite3 and sharp if needed)
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install

WORKDIR /opt/app
COPY . .
ENV PATH /opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node
RUN ["npm", "run", "build"]
EXPOSE 1337
CMD ["npm", "run", "start"]
