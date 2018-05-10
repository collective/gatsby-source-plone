[![Build Status](https://travis-ci.org/collective/gatsby-source-plone.svg?branch=add_source_dependency)](https://travis-ci.org/collective/gatsby-source-plone)

# gatsby-source-plone

Source plugin for pulling data into Gatsby from Plone sites.

Pulls data from Plone sites with
[plone.restapi](https://github.com/plone/plone.restapi) installed.

## Install

`npm install --save gatsby-source-plone` (not yet published)

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-plone`
  }
];
```

## How to query

You can query nodes created from Plone like the following:

```graphql
{
  allNewsItem {
    edges {
      node {
        title
        Description
        ...
      }
    }
  }
}
```

## Development

### Code Checkout

Checkout sources from github:

```bash:
git clone git@github.com:collective/gatsby-source-plone.git
```

### Set up Node

Make sure you use the latest NodeJS LTS version (currently 8.9.4). We recommend to use [http://nvm.sh/]nvm for local development.

### Set up Docker

We use Docker for handling the backend plone.restapi, and so it's required to have [docker-compose](https://docs.docker.com/compose/install/) installed.

### Build

Build project frontend:

```bash:
make build
```

Setup Plone backend API server with Docker:
```bash:
docker-compose up
```

### Dev Environment

Start Plone backend API server:

```bash
docker-compose up
```

Gatsby Development Mode:

```bash
(cd tests/gatsby-starter-default && gatsby develop)
```

Build Gatsby:

```bash
(cd tests/gatsby-starter-default && gatsby build)
```

Start Gatsby:
```bash
(cd tests/gatsby-starter-default && gatsby serve)
```

### Tests

Run acceptance tests:

```bash:
make test
```

This command will automatically fire up the Plone backend, build and start Gatsby and the execute the selenium-based acceptance tests.
