{ pkgs ? import (fetchTarball {
    url = "https://github.com/NixOS/nixpkgs-channels/archive/5f707e8e06fba30126a6627bc9cce9d3b4a12900.tar.gz";
    sha256 = "0vv2ribx6g4jgn0bzpjdz4l43j4nbb5ywvj5ajg29kappyay7jsi";
  }) {}
}:

let self = rec {

  # python packages

  pythonPackages = (import ./setup.nix {
    inherit pkgs;
    pythonPackages = pkgs.python37Packages;
  }).pythonPackages;

  # jupyter

  jupyter = pythonPackages.jupyter.overridePythonAttrs (old: {
    propagatedBuildInputs =
    with pythonPackages; old.propagatedBuildInputs ++ [
        jupyterlab
        RESTinstance
        robotframework
        robotframework-seleniumlibrary
        robotkernel
    ];
  });

  # Configure Jupyter environment
  jupyter_config_dir = pkgs.stdenv.mkDerivation {
    name = "jupyter";
    builder = with pythonPackages; pkgs.writeText "builder.sh" ''
      source $stdenv/setup
      mkdir -p $out/share/jupyter/nbextensions
      mkdir -p $out/share/jupyter/migrated
      ${pythonPackages.python.withPackages (ps: with ps; [ robotkernel ])}/bin/python -m robotkernel.install --prefix=$out
    '';
  };
};

in with self;

pkgs.stdenv.mkDerivation {
  name = "jupyter";
  buildInputs = [
    pkgs.firefox
    pkgs.geckodriver
    jupyter
    jupyter_config_dir
  ];
  shellHook = ''
    mkdir -p $PWD/.jupyter
    export JUPYTER_CONFIG_DIR=${jupyter_config_dir}/share/jupyter
    export JUPYTER_PATH=${jupyter_config_dir}/share/jupyter
    export JUPYTER_DATA_DIR=$PWD/.jupyter
    export JUPYTER_RUNTIME_DIR=$PWD/.jupyter
    export SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt
  '';
}
