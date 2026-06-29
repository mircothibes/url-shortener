# syntax=docker/dockerfile:1

# ---------- Stage 1: build the Vite static site ----------
FROM node:24-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Public build-time config, injected as build args and baked into the
# bundle. Passed explicitly at build time (via cloudbuild.yaml) instead
# of relying on a .env file, which gcloud excludes from the build context.
ARG VITE_API_URL
ARG VITE_API_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY

# Build the static site
COPY . .
RUN npm run build

# ---------- Stage 2: serve the static files with nginx ----------
FROM nginx:alpine

# SPA-aware config. The official nginx image substitutes ${PORT}
# (provided by Cloud Run) into this template at container startup.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy only the built static output
COPY --from=build /app/dist /usr/share/nginx/html
