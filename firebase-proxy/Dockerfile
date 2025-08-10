# Use an official Node.js runtime as a parent image
FROM node:18-alpine3.18

# Create non-root user and group
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/sh -D appuser


# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if using)
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application code
COPY . .

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Run the application
CMD [ "npm", "start" ]

# Switch to non-root user
USER appuser

# Security Best Practices:
# Integrate vulnerability scanning into the CI/CD pipeline for this image.
# Implement image signing to ensure image integrity and authenticity.