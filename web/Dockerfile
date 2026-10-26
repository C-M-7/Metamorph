# ─────────────────────────────────────────────
# Stage 1: Build Frontend (React 18 + Vite + TS)
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration (port 3000 with SPA routing & reverse proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
