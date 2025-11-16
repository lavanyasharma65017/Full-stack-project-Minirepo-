# Stage 1: Build (If using TypeScript/NestJS CLI build)
FROM node:20-alpine AS build

WORKDIR /app
# Copy package files from the monorepo root
COPY package.json yarn.lock ./
# Copy workspace-specific files
COPY apps/backend/package.json apps/backend/
COPY apps/backend/tsconfig.build.json apps/backend/
COPY apps/backend/tsconfig.json apps/backend/
# ... (copy other shared files if necessary)

RUN yarn install --frozen-lockfile

# Copy source code and build
COPY apps/backend/src apps/backend/src
COPY apps/backend/prisma apps/backend/prisma

WORKDIR /app/apps/backend
RUN yarn build # Assuming `yarn build` is configured in package.json to output to dist/

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built application and prisma files
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/apps/backend/.env.example ./.env.example 

# Set environment variables for runtime
ENV NODE_ENV production

# Expose port (must match docker-compose)
EXPOSE 3000

# Run the API server (and cron/schedule/worker embedded in the main app)
CMD ["node", "dist/main"]