# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────
# Stage 1 – build
# ─────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Layer-cache: reinstall only when lock-file changes
COPY package*.json ./
RUN npm ci --ignore-scripts

# Source
COPY . .

# Production bundle
RUN npx nx build web --configuration=production

# ─────────────────────────────────────────────
# Stage 2 – production image
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Drop root – run as nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
  && chmod -R 755 /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist/apps/web/browser /usr/share/nginx/html

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
