{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.bashInteractive
    pkgs.nodejs
    pkgs.npm
    pkgs.nano
  ];
}