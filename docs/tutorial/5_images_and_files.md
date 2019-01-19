# Image and File Handling

Media content that can be displayed or downloaded are first downloaded into the Gatsby cache by the plugin and later queried in by the Gatsby site. This allows image optimization and manipulation with the Sharp plugin and helps configure file download for other types.

## Files

Handling file node creation in the Gatsby-site would require configuration of [gatsby-source-filesystem](https://v2--gatsbyjs.netlify.com/packages/gatsby-source-filesystem).

Firstly, make sure you install it with:

```
yarn add gatsby-source-filesystem
```

Then in `gatsby-config.js`:

```javascript
    // Note: gatsby-source-filesystems is required also to make Plone
    // to have publicURL and be downloadable from the gatsby site
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/static`,
      },
    },
```

For the plugin to work, you need to create a static folder and configure it with the plugin, here we've created `/src/static` and added it to `path`.

Now in GraphQL, file nodes will be available to query as:

```graphql
allPloneFile(filter: { _backlinks: { eq: $path } }) {
  edges {
    node {
      id
      title
      description
      file {
        filename
        publicURL
      }
      _type
      _path
    }
  }
}
```

# Images

Configuring gatsby-source-filesystem, images, along with other file types are downloaded into the Gatsby cache. But instead of just getting their publicURLs, they can be processed by Sharp plugins and optimized images can be queried. For more information about go through the documentation for [gatsby-plugin-sharp](https://v2--gatsbyjs.netlify.com/packages/gatsby-plugin-sharp/) and [gatsby-transformer-sharp](https://v2--gatsbyjs.netlify.com/packages/gatsby-transformer-sharp)

Install the plugins required:

```bash
yarn add gatsby-image gatsby-plugin-sharp gatsby-transformer-sharp
```

In the `gatsby-config.js` these just need to be added, no other options required:

```javascript
plugins: [
  ...
  'gatsby-plugin-sharp',
  'gatsby-transformer-sharp',
],
```

Now to query from GraphQL:

```graphql
  allPloneImage {
      edges {
        node {
          id
          title
          image {
            publicURL
            childImageSharp {
              fixed(width: 600) {
                ...GatsbyImageSharpFixed
              }
            }
          }
          _path
        }
      }
    }
```

This query returns all images in width `600px` but you configure this with a wide range of options. We'd recommend going through the Sharp docs mentioned above.

Next: [RichText Component](https://github.com/collective/gatsby-source-plone/blob/master/docs/tutorial/6_richtext_component.md)
