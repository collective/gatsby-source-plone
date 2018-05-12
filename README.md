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

Make sure you use the latest NodeJS LTS version (currently 8.11.1). We recommend to use [http://nvm.sh/]nvm for local development.

### Set up Docker

We use Docker for handling the backend plone.restapi, and so it's required to have [docker-compose](https://docs.docker.com/compose/install/) installed.

### Build

Build project frontend:

```bash
make build
```

### Dev Environment

Gatsby Development Mode:

```bash
make develop
```

Build Gatsby:

```bash
make build
```

Start Gatsby:

```bash
make serve
```

Stop Plone API server (started by any of the above):

```bash
make stop
```

Clean everything and reset the environment:

```bash
make purge
```

### Tests

Run acceptance tests:

```bash
make test
```

This command will automatically fire up the Plone backend, build and start Gatsby and the execute the selenium-based acceptance tests.
