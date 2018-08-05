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

# Displaying queried data in site

In our Gatsby site's index page, let's display a document. Here we have a document _frontpage_ which has the information to be displayed at root.

To get the data via GraphQL:

```graphql
query IndexPageQuery {
  ploneDocument(_path: { eq: "/frontpage/" }) {
    title
    description
  }
}
```

Displaying this data retrieved in the page:

```javascript
const IndexPage = ({ data }) => (
  <Layout>
    <article>
      <h1>{data.ploneDocument.title}</h1>
      <p>{data.ploneDocument.description}</p>
    </article>
  </Layout>
);
```

Simple as that, we've got the index page to display content of a document sourced from our Plone site.

# Authentication

Directly sourcing data from the Plone site and getting all the objects would only work on Plone sites with anonymous access enabled, often it's the case we may need to authorize the plugin with JWT token before we're able to use it.

Step by step explanation on how to set this up is given in the [authentication docs](https://collective.github.io/gatsby-source-plone/reference/authentication/).

Next: [Page Creation](3_page_creation)
