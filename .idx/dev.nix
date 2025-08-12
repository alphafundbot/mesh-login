# ~/studio/dev.nix
{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-23.05.tar.gz") {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.git
    pkgs.curl
    pkgs.nodejs
    pkgs.openssl
  ];

  shellHook = ''
    echo "✅ Thin Wallet shell activated"
    echo "🔐 Wallet auth and overlay scaffolding ready"
  '';
}