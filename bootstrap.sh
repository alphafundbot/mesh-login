#!/bin/bash

echo "🔧 Building strategist-grade mesh containers..."
docker-compose build

echo "🚀 Starting containers with AU-connect validation..."
docker-compose up -d

echo "🧠 Validating hydration and audit overlays..."
sleep 5
curl http://localhost:8080/status
curl http://localhost:8080/visual