SHELL := /usr/bin/env bash
export PATH := node_modules/.bin:$(PATH)

SOURCES := $(shell find src -type f)

.PHONY: all
all: build

build: node_modules $(SOURCES)

.PHONY: publish-to-backend
publish-to-backend: start-backend
	docs/publish.sh

.PHONY: purge
purge: clean
	$(RM) -r node_modules
	$(MAKE) -C tests/gatsby-starter-default purge

.PHONY: prettier
prettier: node_modules
	prettier --write $$(find src -name "*.js")
	$(MAKE) -C tests/gatsby-starter-default prettier

test: node_modules

%:
	$(MAKE) -C tests/gatsby-starter-default $*

node_modules: package.json
	yarn install
	yarn link
