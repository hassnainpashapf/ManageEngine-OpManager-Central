FROM node:24-alpine

WORKDIR /app

# Install native network utilities for authentic Ping, Traceroute, and Network Diagnostics in container
RUN apk add --no-cache iputils iproute2 traceroute curl net-tools

# Copy package files
COPY package*.json ./

# Install production dependencies
# NOTE: npm install (not npm ci) — ssh2's optional native deps
# (cpu-features, nan) have no resolved entries in package-lock.json,
# and npm ci hard-fails on that (EUSAGE). npm install tolerates them;
# ssh2 works without them.
RUN npm install --omit=dev

# Copy project files (.dockerignore excludes .git, node_modules, scripts,
# docs, and the runtime/seed data files — no seed.json, db.json, SQLite DB,
# or hardcoded API key is ever baked into the image; server/data/templates/
# and server/data/mibs/ ARE copied — they are real reference data)
COPY . .

# SQLite DB lives on a volume so data survives container rebuilds
VOLUME /app/server/data

# Expose OpManager Central default port
EXPOSE 8060

ENV PORT=8060
ENV NODE_ENV=production

# Health check to ensure service readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8060/login.html || exit 1

# Start OpManager Central server
CMD ["node", "server/index.js"]
