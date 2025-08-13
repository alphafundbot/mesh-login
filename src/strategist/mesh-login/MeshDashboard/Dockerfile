# Use an official Node.js runtime as a parent image
FROM node:18-alpine3.18

# Create non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Add comments for CI/CD scanning and signing
# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Define the command to start the application
CMD [ "npm", "start" ]

# Switch to the non-root user
USER appuser

# TODO: Integrate vulnerability scanning into the CI/CD pipeline for this image
# TODO: Integrate image signing into the CI/CD pipeline for this image