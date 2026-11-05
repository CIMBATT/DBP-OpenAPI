FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && curl -fsSL https://pgp.mongodb.com/server-8.0.asc \
        | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg \
    && echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
        > /etc/apt/sources.list.d/mongodb-org-8.0.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends mongodb-org-server \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /data/db \
    && chown node:node /data/db
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Default config; mount your own over /app/config.yaml (mongoHost must be reachable from the container).
COPY config.yaml openapi.yaml ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod 755 ./docker-entrypoint.sh

EXPOSE 8080
VOLUME ["/data/db"]
USER node
CMD ["./docker-entrypoint.sh"]
