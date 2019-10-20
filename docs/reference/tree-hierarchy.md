# How content hierarchy is mapped

This plugin does expose Plone content hierarchy in Gatsby GraphQL queries directly. Each folderish content node will contain a special `nodes` attribute, which links to children for that node (GraphQLUnionType). In addition, each node will also  contain a special attribute `_path` describing the position of node in content hierarchy. Container nodes will contain `_path` attribute also for each item in its `items` attribute returned by Plone REST API.

In `./demo`, use of `_path` is illustrated for instance, in the [Folder component](https://github.com/collective/gatsby-source-plone/blob/master/demo/src/components/Folder.js), where details of it's children are retrieved:

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
