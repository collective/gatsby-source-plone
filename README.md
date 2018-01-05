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

### Set up Python

Make sure you have Python 2.7 and [https://virtualenv.pypa.io](virtualenv) installed.

### Build

Build project:

```bash:
make build
```

### Tests

Run acceptance tests:

```bash:
make test
```
