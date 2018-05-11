SHELL := /usr/bin/env bash
export PATH := node_modules/.bin:$(PATH)

.PHONY: all
all: test

.PHONY: clean
clean:
	make -C tests/gatsby-starter-default clean

.PHONY: purge
purge: clean
	$(RM) -r node_modules
	make -C tests/gatsby-starter-default purge

.PHONY: test
test: node_modules
	make -C tests/gatsby-starter-default

.PHONY: prettier
prettier: node_modules
	prettier --write --trailing-comma es5 --no-semi --single-quote \
	  $$(find src -name "*.js")
	prettier --write $$(find src -name "*.css")

node_modules: package.json
	yarn install
	yarn link
