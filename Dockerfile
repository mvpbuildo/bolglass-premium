# Multi-stage Dockerfile for Bolglass Monorepo
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies needed for some node modules
RUN apt-get update -y && apt-get install -y openssl libc6

# Copy root workspace files
COPY package.json package-lock.json turbo.json ./
# Copy app and package manifests for layer caching
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run db:generate

# Build the app using Turbo
RUN npm run build -- --filter=@bolglass/web

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy necessary files from builder
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start the application using npm workspace
CMD ["npm", "run", "start", "-w", "apps/web", "--", "-p", "3000"]
