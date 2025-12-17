# Stage 1: Build
FROM node:20-alpine AS build
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1
WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install
WORKDIR /opt/app
COPY . .
ENV PATH /opt/node_modules/.bin:$PATH

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

RUN npm run build

# Stage 2: Production
FROM node:20-alpine
RUN apk add --no-cache vips-dev
WORKDIR /opt/app
COPY --from=build /opt/node_modules ./node_modules
COPY --from=build /opt/app ./
ENV PATH /opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
