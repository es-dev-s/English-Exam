# syntax=docker/dockerfile:1
# Two deployable targets built from this file:
#   api  - Express + PostgreSQL API (server/)
#   web  - nginx serving the built React client and proxying /api to the api service

# ---------- API ----------
FROM node:24-bookworm-slim AS api-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS api
ENV NODE_ENV=production \
    PORT=3010 \
    HOST=0.0.0.0 \
    CV_UPLOAD_DIR=/data/uploads/cvs
WORKDIR /app/server
COPY --from=api-deps /app/server/node_modules ./node_modules
COPY server/ ./
# /data holds uploaded CVs (mounted as a volume). The database is external (PostgreSQL).
RUN mkdir -p /data/uploads/cvs && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3010)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "index.js"]

# ---------- Client build ----------
FROM node:24-bookworm-slim AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
# Empty (but defined) VITE_API_URL makes the client call same-origin /api, which nginx proxies.
ENV VITE_API_URL=""
RUN npm run build

# ---------- Web (static client + reverse proxy) ----------
FROM nginx:1.27-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /app/client/dist /usr/share/nginx/html
EXPOSE 80
