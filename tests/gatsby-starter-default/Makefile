SHELL := /usr/bin/env bash
export PATH := node_modules/.bin:pyvenv/bin:$(PATH)

SOURCES := $(find src -type f)
HTTP_GET := curl --silent --fail --output /dev/null

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
    GECKODRIVER = https://github.com/mozilla/geckodriver/releases/download/v0.20.1/geckodriver-v0.20.1-linux64.tar.gz
endif
ifeq ($(UNAME_S),Darwin)
    GECKODRIVER = https://github.com/mozilla/geckodriver/releases/download/v0.20.1/geckodriver-v0.20.1-macos.tar.gz
endif

.PHONY: all
all: test

.PHONY: clean
clean:
	$(RM) -r public

.PHONY: purge
purge: clean
	$(RM) -r node_modules pyvenv
	docker-compose rm -fv

.PHONY: build
build: public

.PHONY: test
test: clean build pyvenv
	gatsby serve & pid=$$! && \
	  while ! $$($(HTTP_GET) http://localhost:9000/); do sleep 1; done && \
	  pybot test.robot; \
	  status=$$?; \
	  kill $$pid; \
	  exit $$status

.PHONY: prettier
prettier: node_modules
	prettier --write --trailing-comma es5 --no-semi --single-quote \
	  $$(find src -name "*.js")
	prettier --write $$(find src -name "*.css")

public: node_modules $(SOURCES)
	docker-compose up -d
	while ! $$($(HTTP_GET) http://localhost:8080/); do sleep 1; done
	gatsby build
	docker-compose stop

pyvenv: requirements.txt
	python3 -m venv --upgrade pyvenv
	pyvenv/bin/python -m ensurepip --upgrade
	pyvenv/bin/pip install -U -r requirements.txt
	curl -L -O $(GECKODRIVER)
	tar -xzf $$(basename $(GECKODRIVER)) -C pyvenv/bin
	$(RM) $$(basename $(GECKODRIVER))

node_modules: package.json
	yarn install
	yarn link gatsby-source-plone
