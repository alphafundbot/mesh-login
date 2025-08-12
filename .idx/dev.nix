let
  nixpkgs = import (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/nixos-23.05.tar.gz";
    sha256 = "05cbl1k193c9la9xhlz4y6y8ijpb2mkaqrab30zij6z4kqgclsrd";
  }) {};
in

nixpkgs.mkShell {
  buildInputs = [
    nixpkgs.bashInteractive
    nixpkgs.nodejs
    nixpkgs.nodePackages.npm
    nixpkgs.nano
  ];
}