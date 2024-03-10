FROM node:alpine as build
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html