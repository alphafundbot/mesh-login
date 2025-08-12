let
  pkgs = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-23.05.tar.gz") {};
in

pkgs.mkShell {
  buildInputs = [
    pkgs.git
    pkgs.curl
    pkgs.nodejs
    pkgs.openssl
    pkgs.nano
    (pkgs.callPackage ./wallet-auth.nix {})
    (pkgs.callPackage ./overlay.nix {})
    (pkgs.callPackage ./mesh-dashboard.nix {})
  ];

  shellHook = ''
    wallet-auth-init
    overlay-preload
    mesh-dashboard-init
    echo "🚀 Strategist shell fully activated"
  '';
}