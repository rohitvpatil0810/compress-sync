FROM node:22.14.0 AS builder

# Set working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining project files except .env and .env-example
COPY . ./

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "run", "start"]

# sudo docker run -d -it -p 8080:80 --env-file ./.env task-manager-ts