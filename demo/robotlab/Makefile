PYTHON ?= python3

.PHONY: all
all:

nix-%: $(NETRC)
	nix-shell setup.nix -A develop --argstr python $(PYTHON) --run "$(MAKE) $*"

.PHONY: nix-shell
nix-shell:
	nix-shell setup.nix -A develop --argstr python $(PYTHON)

env:
	nix-build setup.nix -A env --argstr python $(PYTHON) -o env

###

requirements-$(PYTHON).txt: requirements.txt
	nix-shell -p libffi nix --run '\
	nix-shell setup.nix -A pip2nix --argstr python $(PYTHON) --run "\
	pip2nix generate -r requirements.txt --output=requirements-$(PYTHON).nix\
	"\
	'
	@grep "name" requirements-$(PYTHON).nix|grep -Eo "\"(.*)\""|grep -Eo "[^\"]+"|sed -r "s|-([0-9\.]+)|==\1|g"|grep -v "setuptools=">requirements-$(PYTHON).txt
	touch requirements-$(PYTHON).nix

requirements: requirements-$(PYTHON).txt
	nix-shell -p libffi nix --run '\
	nix-shell setup.nix -A pip2nix --argstr python $(PYTHON) --run "\
	pip2nix generate -r requirements-$(PYTHON).txt --output=requirements-$(PYTHON).nix\
	"\
	'

.PHONY: upgrade
upgrade:
	nix-shell --pure -p cacert curl gnumake jq nix --run "make -f Makefile setup.nix"

.PHONY: setup.nix
setup.nix:
	@echo "Updating nixpkgs/nixos-19.03 revision"; \
	rev=$$(curl https://api.github.com/repos/NixOS/nixpkgs-channels/branches/nixos-19.03|jq -r .commit.sha); \
	echo "Updating nixpkgs $$rev hash"; \
	sha=$$(nix-prefetch-url --unpack https://github.com/NixOS/nixpkgs-channels/archive/$$rev.tar.gz); \
	sed -i "2s|.*|    url = \"https://github.com/NixOS/nixpkgs-channels/archive/$$rev.tar.gz\";|" setup.nix; \
	sed -i "3s|.*|    sha256 = \"$$sha\";|" setup.nix;
	@echo "Updating setup.nix revision"; \
	rev=$$(curl https://api.github.com/repos/datakurre/setup.nix/branches/master|jq -r ".commit.sha"); \
	echo "Updating setup.nix $$rev hash"; \
	sha=$$(nix-prefetch-url --unpack https://github.com/datakurre/setup.nix/archive/$$rev.tar.gz); \
	sed -i "6s|.*|    url = \"https://github.com/datakurre/setup.nix/archive/$$rev.tar.gz\";|" setup.nix; \
	sed -i "7s|.*|    sha256 = \"$$sha\";|" setup.nix
