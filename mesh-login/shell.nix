nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.yarn
    pkgs.typescript
    pkgs.webpack
    pkgs.webpack-cli
  ];

  shellHook = ''
    echo "🔮 Strategist shell activated: mesh-login cockpit ready."
  '';
}