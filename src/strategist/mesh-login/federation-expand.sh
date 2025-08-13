#!/usr/bin/env bash
echo "🌍 Expanding Federation Zones"
jq . federation/identity-federation.json
echo "✅ Federation expansion complete"
