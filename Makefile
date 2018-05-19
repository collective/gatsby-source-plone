SHELL := /usr/bin/env bash
export PATH := node_modules/.bin:$(PATH)

SOURCES := $(shell find src -type f)

.PHONY: all
all: build

build: tests/gatsby-starter-default/public

.PHONY: clean
clean:
	make -C tests/gatsby-starter-default clean

.PHONY: purge
purge: clean
	$(RM) -r node_modules
	make -C tests/gatsby-starter-default purge

.PHONY: prettier
prettier: node_modules
	prettier --write $$(find src -name "*.js")
	make -C tests/gatsby-starter-default prettier

.PHONY: develop
develop:
	make -C tests/gatsby-starter-default develop

.PHONY: watch
watch: develop

.PHONY: serve
serve:
	make -C tests/gatsby-starter-default serve

.PHONY: stop
stop:
	make -C tests/gatsby-starter-default stop

.PHONY: test
test: node_modules
	make -C tests/gatsby-starter-default

tests/gatsby-starter-default/public: node_modules $(SOURCES)
	make -C tests/gatsby-starter-default clean build

node_modules: package.json
	yarn install
	yarn link
