# A generic multi-stage Dockerfile for building and serving a front‑end application.
#
# This file assumes your project is a Node.js based application (e.g. React,
# Vue or Angular) with a standard package.json at the root. It uses a
# builder stage to compile the source into static assets, then an Nginx
# stage to serve the compiled files efficiently. If your project structure
# differs, you can adjust the paths and commands accordingly.

## Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Install dependencies defined in package.json and package-lock.json (or
# yarn.lock). Using npm ci is preferred for deterministic builds when
# package-lock.json exists.
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy all other source code into the container and build the project.
COPY . ./

# The build command should output compiled files into a `dist`, `build` or
# similar directory. Adjust this if your project uses a different output
# directory.
RUN npm run build

## Stage 2: Serve the built assets with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage into Nginx's default
# public folder. Replace `build` with your actual output directory if
# different (e.g. `dist`).
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80 to allow traffic into the container. If you need HTTPS,
# you'll handle that at the orchestration layer (e.g. with a reverse proxy).
EXPOSE 80

# Start Nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]