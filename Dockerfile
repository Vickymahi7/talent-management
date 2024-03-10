FROM node:18-alpine

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies in the Docker image
RUN npm install --only=production

# Copy the rest of the app's source code to the working directory
COPY . .
RUN npm run build

# Expose port 3000 for the app
EXPOSE 3000

# Define the command to run the app
CMD [ "npm", "start" ]
