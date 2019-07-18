SHELL := /usr/bin/env bash
export PATH := node_modules/.bin:pyvenv/bin:$(PATH)

SOURCES := $(shell find src -type f)
HTTP_GET := curl --silent --fail --output /dev/null

GATSBY_BUILD_FLAGS ?=

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	GECKODRIVER = https://github.com/mozilla/geckodriver/releases/download/v0.20.1/geckodriver-v0.20.1-linux64.tar.gz
endif
ifeq ($(UNAME_S),Darwin)
	GECKODRIVER = https://github.com/mozilla/geckodriver/releases/download/v0.20.1/geckodriver-v0.20.1-macos.tar.gz
endif

.PHONY: all
all: test

build: public

.PHONY: clean
clean:
	$(RM) -r .cache public

.PHONY: develop
develop: node_modules
	docker-compose up -d
	gatsby develop

.PHONY: export-fixture
export-fixture: start-backend
	fixture/export.sh

.PHONY: import-fixture
import-fixture: start-backend
	fixture/import.sh

.PHONY: init-backend
init-backend: start-backend
	fixture/purge.sh
	fixture/import.sh

.PHONY: purge
purge: clean stop-backend
	docker-compose rm -fv
	$(RM) -r node_modules pyvenv

.PHONY: prettier
prettier: node_modules
	prettier --write $$(find src -name "*.js")
	prettier --write --single-quote false $$(find src -name "*.scss")

.PHONY: serve
serve: node_modules public
	gatsby serve

.PHONY: start-backend
start-backend:
	docker-compose up -d
	while ! $$($(HTTP_GET) http://localhost:8080/); do sleep 1; done

.PHONY: stop-backend
stop-backend:
	docker-compose stop

.PHONY: test
test: clean build pyvenv
	prettier -c $$(find src -name "*.js")
	prettier -c --single-quote false $$(find src -name "*.scss")
	gatsby serve & pid=$$! && \
	  while ! $$($(HTTP_GET) http://localhost:9000/); do sleep 1; done && \
	  robot -v BROWSER:headlessfirefox test.robot; \
	  status=$$?; \
	  kill $$pid; \
	  exit $$status
	gatsby develop -p 9000 & pid=$$! && \
	  while ! $$($(HTTP_GET) http://localhost:9000/); do sleep 1; done && \
	  robot -v GATSBY_PORT:9000 -v BROWSER:headlessfirefox test-updates.robot; \
	  status=$$?; \
	  kill $$pid; \
	  exit $$status

.PHONY: watch
watch: develop

public: start-backend node_modules $(SOURCES)
public: src/styles/_typography.scss
	gatsby build ${GATSBY_BUILD_FLAGS}

pyvenv: requirements.txt
	$(RM) -r pyvenv
	python3 -m venv --without-pip pyvenv
	curl https://bootstrap.pypa.io/get-pip.py | pyvenv/bin/python
	pyvenv/bin/pip install -U -r requirements.txt
	curl -L -O $(GECKODRIVER)
	tar -xzf $$(basename $(GECKODRIVER)) -C pyvenv/bin
	$(RM) $$(basename $(GECKODRIVER))

node_modules: package.json
	yarn install
	$(RM) -r node_modules/gatsby-source-plone
	mkdir node_modules/gatsby-source-plone
	ln -sf ../../../package.json node_modules/gatsby-source-plone
	ln -sf ../../../index.js node_modules/gatsby-source-plone
	ln -sf ../../../gatsby-node.js node_modules/gatsby-source-plone
	ln -sf ../../../utils.js node_modules/gatsby-source-plone

src/styles/_typography.scss:
	node -e "console.log(new require('typography')(require('typography-theme-twin-peaks')).toString())" \
	> src/styles/_typography.scss
