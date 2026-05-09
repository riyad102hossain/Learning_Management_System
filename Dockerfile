# Use the official Node.js 20 image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies (including dev dependencies for hot reload)
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]