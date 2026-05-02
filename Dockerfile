# Stage 1: Development
FROM node:23-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Run in development mode with watch
CMD ["npm", "run", "start:dev"]
