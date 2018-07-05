{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation rec {
  name = "gatsby-env";
  buildInputs = with pkgs; [
    geckodriver
    jq
    lcms2
    libpng
    nodejs-9_x
    pkgconfig
    python3
    travis
    zlib
    (yarn.override {
      nodejs = nodejs-9_x;
    })
  ];
  shellHook = ''
    export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
  '';
}
