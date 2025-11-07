# Start from the official Node image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (this is cached by Docker)
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Expose the port (good practice)
EXPOSE 3000

# The default command to run when the container starts
CMD ["npm", "start"]