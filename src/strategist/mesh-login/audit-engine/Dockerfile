# Use an official Python runtime as a parent image
FROM python:3.9.16-slim-buster

# Set the working directory in the container
WORKDIR /app

# Create a non-root user and group
RUN groupadd appgroup && useradd -r -g appgroup -s /bin/bash appuser

# Change ownership of the /app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Switch to the non-root user
USER appuser

# Run the main Python script when the container launches
CMD ["python", "main.py"]

# Security Recommendations:
# Integrate vulnerability scanning (e.g., Trivy, Clair) into the CI/CD pipeline for this image.
# Implement image signing (e.g., Notary, cosign) to ensure image integrity.