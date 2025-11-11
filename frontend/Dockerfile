# Use the official Node.js 18 image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Your app runs on port 3000, so "expose" it
EXPOSE 3000

# Run the "start" script
CMD ["npm", "start"]