SHELL := /bin/bash
CURRENT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

all: clean build test

clean:
	@echo "Clean"
	rm -rf api/bin api/lib

build:
	@echo "Build"
	(cd api && virtualenv-2.7 . || virtualenv .)
	(cd api && bin/pip install -r requirements.txt)
	(cd api && bin/buildout)

test:
	@echo "Run Tests"
	yarn install
	(cd tests/gatsby-starter-default && yarn install)
	(cd tests/gatsby-starter-default && gatsby develop &)
	sleep 10
	pybot test.robot
