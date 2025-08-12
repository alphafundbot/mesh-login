nix
{ pkgs }:

pkgs.writeShellScriptBin "overlay-preload" ''
  echo "🧠 Preloading strategist overlays..."
  export STRATEGIST_PORTS=$(cat strategist-ports.json)
  echo "📡 Ports loaded: $STRATEGIST_PORTS"
  echo "🖼️ Visual overlays activated"
''