FROM node:22-alpine

# Install curl for health checks and http-server globally in one layer
RUN apk add --no-cache curl && \
    npm install -g http-server

WORKDIR /app/typescript

# Copy package files first for better caching
COPY typescript/package.json typescript/package-lock.json ./

# Install dependencies early to cache this expensive step
RUN npm ci CYPRESS_INSTALL_BINARY=0 --ignore-scripts --workspace-root

# Copy configuration files
COPY typescript/tsconfig.json typescript/nx.json ./

COPY typescript/.storybook ./.storybook
COPY example-data ../example-data

# Copy source code (these change more frequently)
COPY typescript/packages ./packages

# Install remaining workspace dependencies
RUN npm ci CYPRESS_INSTALL_BINARY=0 --ignore-scripts

# Build storybook statically
RUN npm run build-storybook

# Expose port 6006
EXPOSE 6006

# Serve the built storybook with http-server
CMD ["http-server", "storybook-static", "--port", "6006", "-a", "0.0.0.0"]
