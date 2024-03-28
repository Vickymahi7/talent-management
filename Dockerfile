FROM node:18-alpine

# Set the working directory in the Docker image
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json .
RUN npm install --only=production --omit=dev

COPY . .
# RUN tsc

RUN npm run build

# Expose port 3000 for the app
EXPOSE 3000

# Define the command to run the app
CMD [ "npm", "run", "start" ]
