# How content hierarchy is mapped

This plugin does not expose Plone content hierarchy in Gatsby GraphQL queries directly. Instead each node will contain a special attribute `_path` describing the position of node in content hierarchy. Container nodes will contain `_path` attribute also for each item in its `items` attribute returned by Plone REST API.

In `tests/gatsby-starter-default` this is illustrated for instance, in the [Folder component](https://github.com/collective/gatsby-source-plone/blob/master/tests/gatsby-starter-default/src/components/Folder.js), where details of it's children are retrieved:

```graphql
fragment Folder on PloneFolder {
  id
  title
  description
  items {
    _id
    _path
    _type
    description
    title
  }
  _path
}
```
