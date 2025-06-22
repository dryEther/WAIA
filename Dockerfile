# Use the official Node.js Alpine imange to reduce image size
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files separately to install dependencies first (to leverage Docker cache)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on (change if different)
EXPOSE 3000

# Set the command to run your application
CMD ["node", "index.js"]
