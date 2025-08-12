{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-23.05.tar.gz") {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.git
    pkgs.curl
    pkgs.nodejs
    pkgs.openssl
    pkgs.tree
  ];

  shellHook = ''
    export WALLET_SEED=$(openssl rand -hex 32)
    echo "🧬 Wallet seed generated: ${WALLET_SEED}"
    echo "✅ Strategist identity bound: $STRATEGIST_ID"
  '';
}