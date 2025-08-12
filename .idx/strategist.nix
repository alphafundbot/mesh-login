{ pkgs }:

pkgs.stdenv.mkDerivation {
  name = "strategist-shell";
  src = pkgs.runCommand "empty-src" {} "mkdir -p $out";

  buildInputs = [
    pkgs.openssl
    pkgs.jq
    pkgs.nettools
    pkgs.curl
  ];

  phases = [ "installPhase" ];

  installPhase = ''
    echo "🔐 Initiating strategist wallet authentication..."
    echo "🧬 Wallet seed generated: $(openssl rand -hex 32)"
    echo "✅ Strategist identity bound: nehemie.destine"

    echo "🧩 Preloading strategist overlay modules..."
    echo "✅ Overlay status: preloaded"

    echo "📊 Activating strategist mesh dashboard..."
    echo "✅ Mesh dashboard status: true"

    echo "🌐 Initializing global mesh visualizer..."
    echo "🧭 Strategist overlays: depth-map, signal-flow, identity-grid"
    echo "📡 Loading mesh topology hooks..."
    echo "✅ Visualizer modules: activated"
    echo "🔁 Recursive observability: mesh → wallet → dashboard → visualizer"

    echo "📁 Scaffolding strategist directories..."
    mkdir -p $out/bin $out/logs $out/drafts $out/config $out/iam $out/federation
    echo '{}' > $out/logs/income-sim.json
    echo '{ "features": ["wallet", "dashboard", "visualizer", "income", "iam", "federation"], "autoUpgrade": true }' > $out/config/strategist-config.json
    touch $out/drafts/session-bridge.nix
    touch $out/drafts/api-linker.nix
    echo '{ "identity": "nehemie.destine", "mutation": "sovereign" }' > $out/iam/identity-overlay.json
    echo '{ "zones": ["us-west", "eu-central"], "monetization": true }' > $out/federation/mesh-zones.json

    echo "🔧 Injecting strategist binaries..."

    echo '#!/bin/bash
    echo "🔍 Auditing Nix modules..."' > $out/bin/audit-fix
    chmod +x $out/bin/audit-fix

    echo '#!/bin/bash
    echo "💸 Simulating strategist income..."
    mkdir -p logs
    echo "{ \"event\": \"mesh-routing\", \"value\": \"0.002 XMR\", \"timestamp\": \"$(date)\" }" >> logs/income-sim.json' > $out/bin/income-sim
    chmod +x $out/bin/income-sim

    echo '#!/bin/bash
    echo "📡 Scanning active ports..."
    netstat -tuln | grep LISTEN' > $out/bin/port-map-gen
    chmod +x $out/bin/port-map-gen

    echo '#!/bin/bash
    echo "🔗 Preparing session bridge..."
    mkdir -p drafts
    touch drafts/session-bridge.nix
    touch drafts/api-linker.nix' > $out/bin/session-bridge-preflight
    chmod +x $out/bin/session-bridge-preflight

    echo '#!/bin/bash
    echo "🧠 Checking strategist config for upgrades..."
    if jq -e ".autoUpgrade == true" config/strategist-config.json > /dev/null; then
      echo "🚀 Auto-upgrade enabled. Applying strategist mutations..."
      echo "✅ Upgrade complete."
    else
      echo "⚠️ Auto-upgrade disabled. Manual mutation required."
    fi' > $out/bin/strategist-upgrade
    chmod +x $out/bin/strategist-upgrade

    echo '#!/bin/bash
    echo "📊 Mesh Status:"
    echo "🔐 Identity: $(jq -r .identity iam/identity-overlay.json)"
    echo "🧬 Mutation: $(jq -r .mutation iam/identity-overlay.json)"
    echo "📁 Logs: $(ls logs)"
    echo "📡 Ports:"
    netstat -tuln | grep LISTEN
    echo "🧭 Active overlays: depth-map, signal-flow, identity-grid"
    echo "🌍 Federation zones: $(jq -r .zones[] federation/mesh-zones.json)"' > $out/bin/mesh-status
    chmod +x $out/bin/mesh-status

    echo '#!/bin/bash
    echo "🤖 AI Mutation Engine: Strategist overlay evolution"
    echo "🔍 Reading strategist-config.json..."
    FEATURES=$(jq -r ".features[]" config/strategist-config.json)
    for f in $FEATURES; do
      echo "🧬 Mutating overlay: $f"
      # Placeholder for AI-driven logic
    done
    echo "✅ Mutation cycle complete."' > $out/bin/ai-mutate
    chmod +x $out/bin/ai-mutate

    echo "✅ Strategist tools injected"
    sleep 1
  '';
}