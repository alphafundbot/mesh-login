# Use a smaller, security-focused base image
FROM python:3.9-alpine3.14

# TODO: Integrate vulnerability scanning into the CI/CD pipeline for this image
# TODO: Implement image signing for enhanced supply chain security

# Set environment variables for non-interactive installation
ENV PYTHONUNBUFFERED 1

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
# Copy only necessary files before installing dependencies
COPY destine-root/requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY destine-root/ /app/

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the Python script when the container launches
CMD ["python", "copilot_root.py"]

# Switch to the non-root user
USER appuser