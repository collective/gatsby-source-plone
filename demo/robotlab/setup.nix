{ pkgs ? import (fetchTarball {
    url = "https://github.com/NixOS/nixpkgs-channels/archive/5f707e8e06fba30126a6627bc9cce9d3b4a12900.tar.gz";
    sha256 = "0vv2ribx6g4jgn0bzpjdz4l43j4nbb5ywvj5ajg29kappyay7jsi";
  }) {}
 , setup ? import (fetchTarball {
    url = "https://github.com/datakurre/setup.nix/archive/e835238aed6a0058cf3fd0f3d6ae603532db5cb4.tar.gz";
    sha256 = "0gak3pg5nrrhxj2cws313jz80pmdys047ypnyhagvrfry5a9wa48";
  })
#, setup ? import ../setup.nix
, python ? "python3"
, pythonPackages ? builtins.getAttr (python + "Packages") pkgs
, requirements ? ./. + "/requirements-${python}.nix" 
}:

let overrides = self: super: {
 "click" = super."click".overridePythonAttrs(old: {
   patches = [];
 });
 "jsonschema" = super."jsonschema".overridePythonAttrs(old: {
    buildInputs = [
      self."pytest-runner"
      self."setuptools-scm"
    ];
 });
 "pyrsistent" = super."pyrsistent".overridePythonAttrs(old: {
    buildInputs = [ self."pytest-runner" ];
 });
 "pytest" = super."pytest".overridePythonAttrs(old: {
   doCheck = false;
 });
 "simplegeneric" = super."simplegeneric".overridePythonAttrs(old: {
    nativeBuildInputs = [ pkgs.unzip ];
 });
 "robotframework" = super."robotframework".overridePythonAttrs(old: {
    nativeBuildInputs = [ pkgs.unzip ];
 });
}; in

setup {
  inherit pkgs pythonPackages overrides;
  src = requirements;
  buildInputs = with pkgs; [
    firefox
    geckodriver
  ];
}
