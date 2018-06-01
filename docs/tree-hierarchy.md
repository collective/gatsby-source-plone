# Tree Hierarchy

In Gatsby hierarchy between nodes is established using the `parent` and `children` attributes of the node object. These attributes can be assigned with ids establishing the relation. A node can only have one parent and but it's children is an array of nodes.

A sample for this kind of relationship is illustrated in this [gist](https://gist.github.com/ajayns/53c5cef6b83a7d7f70bb369b58706698) in which basic parent-child hierarchy is established and queried.

In `tests/gatsby-starter-default` this is illustrated for instance, in the [Folder component](https://github.com/collective/gatsby-source-plone/blob/master/tests/gatsby-starter-default/src/components/Folder.js), where details of it's children are retrieved:

```graphql
fragment Folder on PloneFolder {
  id
  title
  description
  parent {
    ...Breadcrumbs
  }
  children {
    ...Document
    ...NewsItem
  }
  fields {
    slug
  }
}
```
