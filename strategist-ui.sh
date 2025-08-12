#!/usr/bin/env bash
clear
echo "🧩 Strategist UI Overlay"
echo "------------------------"
echo "1. Mesh Status"
mesh-status
echo "2. Port Map"
netstat -tuln | grep LISTEN
echo "3. Income Stream"
cat income-sim.json
echo "4. Federation Zones"
cat federation/mesh-zones.json
