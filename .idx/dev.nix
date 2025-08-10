nix
let
  pkgs = import <nixpkgs> { };
in

pkgs.mkShell {
  # Add the packages you need here, including podman, fuse-overlayfs, nano, nodejs_20, docker_28, zulu
  buildInputs = [
    pkgs.podman
    pkgs.fuse-overlayfs
    pkgs.nano
    pkgs.nodejs_20
    pkgs.docker_28
    pkgs.zulu
  ];

  # Add the shellHook for HOME export
  shellHook = ''
    export HOME=${toString pkgs.lib.getEnv "HOME"}
  '';
}