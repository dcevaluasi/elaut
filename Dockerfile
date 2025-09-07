# =======================
# Build Stage
# =======================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json dulu → cache-friendly
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

# Build Next.js app
RUN npm run build

# =======================
# Production Stage
# =======================
FROM node:22-alpine AS runner

WORKDIR /app

# Copy build output & prod dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Remove devDependencies
RUN npm prune --production

# Expose default Next.js port
EXPOSE 3030

# Jalankan server
CMD ["npm", "start"]
