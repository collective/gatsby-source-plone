SHELL := /bin/bash
CURRENT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

all: build test

build:
	@echo "Build"
	make build-frontend
	make build-test

build-frontend:
	yarn install
	(cd tests/gatsby-starter-default && yarn install)

test:
	@echo "Run Tests"
	(cd tests/gatsby-starter-default && gatsby build)
	(cd tests/gatsby-starter-default && gatsby serve &)
	sleep 10
	pybot test.robot
