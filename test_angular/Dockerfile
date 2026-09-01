# Multi-stage build for Angular app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/test_angular/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]