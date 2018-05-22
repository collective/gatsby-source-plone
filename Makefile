SHELL := /usr/bin/env bash
export PATH := node_modules/.bin:$(PATH)

SOURCES := $(shell find src -type f)

.PHONY: all
all: build

build: gatsby-node.js

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

watch-plugin:
	babel -w src --out-dir . --ignore __tests__

watch-tests:
	nodemon -w gatsby-node.js \
	--exec "$(MAKE) -C tests/gatsby-starter-default watch"

watch: node_modules
	make -j watch-plugin watch-tests

%:
	$(MAKE) -C tests/gatsby-starter-default $*

gatsby-node.js: node_modules $(SOURCES)
	NODE_ENV=production babel src --out-dir . --ignore __tests__

node_modules: package.json
	yarn install
	yarn link
