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
