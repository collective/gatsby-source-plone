# Querying Data with GraphQL

Once you've got the gatsby project setup with gatsby-source-plone, running `gatsby develop`, although we haven't updated the site itself, the data sourced by the plugin will be available in GraphiQL.

Go to `http://localhost:8000/___graphql`, and in the query:

```graphql
{
  allPloneDocument {
    edges {
      node {
        title
      }
    }
  }
}
```

This would give you a list of titles of all the objects of type `Document` in the Plone site (`PloneDocument` in the gatsby project) in the form:

```json
{
  "data": {
    "allPloneDocument": {
      "edges": [
        {
          "node": {
            "title": "A page"
          }
        },
        {
          "node": {
            "title": "Another page"
          }
        },
      ...
```

# Authentication

Directly sourcing data from the Plone site and getting all the objects would only work on Plone sites with anonymous access enabled, often it's the case we may need to authorize the plugin with JWT token before we're able to use it.

Step by step explanation on how to set this up is given in the [authentication docs](https://collective.github.io/gatsby-source-plone/docs/authentication/).
