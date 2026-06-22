# Use specific pinned versions to avoid vulnerabilities
FROM node:20.12-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Use latest nginx alpine with security patches
FROM nginx:1.27.1-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run as non-root user
RUN adduser -D -H -s /sbin/nologin nginxuser && chown -R nginxuser /usr/share/nginx/html
USER nginxuser

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]