# syntax=docker/dockerfile:1

# ---------- Stage 1: build the Vite static site ----------
FROM node:24-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site. Vite reads VITE_* values from .env at build
# time and bakes them into the bundle. This .env stays in the build
# stage only and never reaches the final image.
COPY . .
RUN npm run build

# ---------- Stage 2: serve the static files with nginx ----------
FROM nginx:alpine

# SPA-aware config. The official nginx image substitutes ${PORT}
# (provided by Cloud Run) into this template at container startup.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy only the built static output
COPY --from=build /app/dist /usr/share/nginx/html
