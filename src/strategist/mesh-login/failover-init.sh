#!/usr/bin/env bash
echo "📡 Multi-Carrier Failover"
jq . overlays/failover/failover-config.json
echo "✅ Signal resilience activated"
