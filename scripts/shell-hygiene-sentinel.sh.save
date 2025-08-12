#!/usr/bin/env bash

# Strategist Shell Hygiene Sentinel
# Enforces nvm compatibility, prefix hygiene, and mutation readiness

echo "🔍 Validating shell hygiene..."

# 1. Check for NVM
if ! command -v nvm &> /dev/null; then
  echo "❌ nvm not found. Please install nvm before proceeding."
  exit 1
fi

# 2. Check active Node version
ACTIVE_NODE=$(nvm current)
echo "🧠 Active Node version: $ACTIVE_NODE"

# 3. Purge NPM_CONFIG_PREFIX if set
if [[ -n "$NPM_CONFIG_PREFIX" ]]; then
  echo "⚠️ NPM_CONFIG_PREFIX is set to '$NPM_CONFIG_PREFIX'. Unsetting..."
  unset NPM_CONFIG_PREFIX
  echo "✅ Prefix unset."
else
  echo "✅ No prefix conflict detected."
fi

# 4. Log shell state
echo "📦 Shell state:"
echo "  Node: $(node -v)"
echo "  NPM: $(npm -v)"
echo "  Prefix: ${NPM_CONFIG_PREFIX:-<unset>}"

echo "✅ Shell hygiene validated. Strategist cockpit is mutation-ready."
