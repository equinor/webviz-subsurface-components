FROM node:22-alpine

# Install curl for health checks and http-server for serving the static build
RUN apk add --no-cache curl git && \
    npm install -g http-server

WORKDIR /app/typescript

# Copy package files first for better caching
COPY typescript/package.json typescript/package-lock.json typescript/.npmrc ./

# Install dependencies early to cache this expensive step
RUN CYPRESS_INSTALL_BINARY=0 npm ci --ignore-scripts --workspace-root

# Copy configuration files
COPY typescript/tsconfig.json typescript/nx.json ./
COPY typescript/.storybook ./.storybook
COPY example-data ../example-data

# Copy source code (these change more frequently)
COPY typescript/packages ./packages

# Install remaining workspace dependencies
RUN CYPRESS_INSTALL_BINARY=0 npm ci --ignore-scripts

# Build workspace packages so their dist entrypoints resolve.
# The build target uses `git clean`, so a git repo must be present.
RUN git init -q . && npx nx run-many --target=build

RUN npm run build-storybook

EXPOSE 6006

CMD ["http-server", "storybook-static", "--port", "6006", "-a", "0.0.0.0"]
