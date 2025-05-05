# Stage 1: Build dell'applicazione React
FROM node:16-alpine AS build
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
EXPOSE 3000
CMD ["npm","start"]