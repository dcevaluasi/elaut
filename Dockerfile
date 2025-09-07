# Stage 1: Build
FROM node:18-alpine AS builder

# Install sistem dependencies buat canvas
RUN apk add --no-cache build-base cairo-dev pango-dev giflib-dev jpeg-dev

WORKDIR /app

# Copy package.json & lockfile dulu, install dependencies
COPY package*.json ./
RUN npm install

# Copy semua source code
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy node_modules & build dari stage sebelumnya
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
