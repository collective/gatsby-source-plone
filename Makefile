SHELL := /bin/bash
CURRENT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

all: clean build test

clean:
	@echo "Clean"
	rm -rf api/bin api/lib

build:
	@echo "Build"
	make build-backend
	make build-frontend
	make build-test

build-backend:
	@echo "Build"
	(cd api && virtualenv-2.7 . || virtualenv .)
	(cd api && bin/pip install -r requirements.txt)
	(cd api && bin/buildout)
	(cd api && bin/instance fg &)

build-frontend:
	yarn install
	(cd tests/gatsby-starter-default && yarn install)

build-test:
	virtualenv-2.7 . || virtualenv .
	bin/pip install -r requirements.txt

test:
	@echo "Run Tests"
	(cd tests/gatsby-starter-default && gatsby build)
	(cd tests/gatsby-starter-default && gatsby serve &)
	sleep 10
	pybot test.robot
