{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation rec {
  name = "gatsby-env";
  buildInputs = with pkgs; [
    geckodriver
    jq
    libpng.dev
    nodejs-9_x
    pngquant
    python3
    travis
    (yarn.override {
      nodejs = nodejs-9_x;
    })
  ];
  shellHook = ''
    export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
    if [ -f tests/gatsby-starter-default/node_modules/pngquant-bin/vendor/pngquant ]; then
      rm tests/gatsby-starter-default/node_modules/pngquant-bin/vendor/pngquant
      ln -s $(which pngquant) tests/gatsby-starter-default/node_modules/pngquant-bin/vendor/pngquant
    fi
  '';
}
