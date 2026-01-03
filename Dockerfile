# Use bare node image for building the application
FROM node:22.20-alpine AS build

# Remove unnecessary logs
ENV OPEN_SOURCE_CONTRIBUTOR=true \
    DISABLE_OPENCOLLECTIVE=true

# Set the working directory
WORKDIR /var/www/html

# Install package manager
RUN npm i -g pnpm

# Copy package information and fetch all packages
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# Copy the rest of the source files and install packages
COPY . .
RUN pnpm install --frozen-lockfile --offline

# Build application
RUN pnpm build

# Start new image from a bare nginx image
FROM nginx:1.29-alpine

# Set the working directory
WORKDIR /var/www/html

# Copy router config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from previous image
COPY --from=build /var/www/html/dist .

# Expose the 8000 port to the host
EXPOSE 8000

# Setup healthcheck functionality
HEALTHCHECK CMD wget -nv -t1 --spider http://0.0.0.0:8000 || exit 1
