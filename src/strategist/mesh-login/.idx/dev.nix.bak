{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.podman
    pkgs.fuse-overlayfs
    pkgs.nano
    pkgs.nodejs_20
    pkgs.docker_24
    pkgs.zulu
  ];

  shellHook = ''
    echo "⚙️  Entered mesh ignition dev shell at $PWD"
  '';
}