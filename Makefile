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
	$(MAKE) -C demo purge

.PHONY: format
format: node_modules
	prettier --write $$(find src -name "*.js")
	$(MAKE) -C demo prettier

.PHONY: prettier
prettier: format

.PHONY: test
test: node_modules
	prettier -c $$(find src -name "*.js")
	jest src

.PHONY: test-all
test-all: test
	make -C demo test

.PHONY: coverage
coverage: node_modules
	jest --coverage src

.PHONY: coveralls
coveralls: coverage
	cat ./coverage/lcov.info | coveralls

.PHONY: show
show: node_modules
	npm pack && tar -xvzf *.tgz && rm -rf package *.tgz

.PHONY: watch-plugin
watch-plugin:
	babel -w src --out-dir . --ignore __tests__

.PHONY: watch-test
watch-test: node_modules
	jest --watch src

.PHONY: watch-tests
watch-tests:
	nodemon -w gatsby-node.js \
	--exec "$(MAKE) -C demo watch"

.PHONY: watch
watch: node_modules
	make -j watch-plugin watch-tests

%:
	$(MAKE) -C demo $*

gatsby-node.js: node_modules $(SOURCES)
	NODE_ENV=production babel src --out-dir . --ignore __tests__

node_modules: package.json
	yarn install
	touch node_modules
