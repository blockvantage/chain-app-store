FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Ensure TypeScript is properly installed
RUN npx tsc --version

# Generate TypeScript declaration file if it doesn't exist
RUN touch next-env.d.ts

# Build the application
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set the backend URL for Docker environment
ENV BACKEND_URL=http://backend:8080

EXPOSE 3000
CMD ["npm", "start"]
