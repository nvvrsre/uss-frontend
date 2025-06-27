# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app source
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the app with NGINX
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config (optional, recommended for single-page apps)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]