# Stage 1: Build dell'applicazione React
FROM node:16-alpine AS build
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Stage 2: Deployment con Nginx
FROM nginx:stable-alpine
COPY --from=build /frontend/build /usr/share/nginx/html
COPY config/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
