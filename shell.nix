{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation rec {
  name = "gatsby-env";
  buildInputs = with pkgs; [
    python3
    geckodriver
    nodejs-9_x
    xsel
    (yarn.override {
      nodejs = nodejs-9_x;
    })
  ];
  shellHook = ''
    export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
  '';
}
