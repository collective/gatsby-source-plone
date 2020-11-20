{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation rec {
  name = "gatsby-env";
  buildInputs = with pkgs; [
    autoconf
    automake
    firefox
    geckodriver
    jq
    lcms2
    libpng
    libtool
    nasm
    nodejs-12_x
    pkgconfig
    python3
    travis
    zlib
    (yarn.override {
      nodejs = nodejs-12_x;
    })
  ];
  shellHook = ''
    export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
  '';
}
