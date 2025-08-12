nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivations rec {
  pname = "my-nodejs-project";
  version = "1.0.0";

  src = ./.;

  nativeBuildInputs = [
    pkgs.nodejs
    pkgs.yarn
    pkgs.typescript
    pkgs.webpack
    pkgs.webpack-cli
  ];

  buildPhase = ''
    yarn install
    yarn run build
  '';

  installPhase = ''
    mkdir -p $out/dist
    cp -r dist/* $out/dist/
  '';
}