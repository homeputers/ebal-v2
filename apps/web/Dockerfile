# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

# Enable Corepack to use the repo-managed Yarn version
RUN corepack enable

# Copy workspace manifests first for better caching
COPY package.json yarn.lock ./
COPY .yarn .yarn
COPY apps/web ./apps/web
COPY packages ./packages

# Set the API base URL at build time with a sensible default
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}

RUN yarn install --immutable
RUN yarn workspace web build

FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
