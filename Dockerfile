# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies - using cache efficiently
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the application
RUN npx nx build app-shell --configuration=production

# Production image
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/dist/apps/app-shell/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

