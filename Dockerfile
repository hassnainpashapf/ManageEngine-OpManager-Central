FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy project files
COPY . .

# Expose OpManager Central default port
EXPOSE 8060

ENV PORT=8060
ENV NODE_ENV=production

# Start OpManager Central server
CMD ["node", "server/index.js"]
