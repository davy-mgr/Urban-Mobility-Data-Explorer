FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start server with hot reload in development
CMD ["npm", "run", "dev"]
