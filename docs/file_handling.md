# File Handling

Gatsby along with the plugin [gatsby-source-filesystem](https://v2--gatsbyjs.netlify.com/packages/gatsby-source-filesystem) and the [`createRemoteFileNode`](https://v2--gatsbyjs.netlify.com/packages/gatsby-source-filesystem#createremotefilenode) function it exposes, can be used to pull all types of remote files into the Gatsby cache and use them in the generated Gatsby-site.

For images, another plugin, [gatsby-transformer-sharp](https://v2--gatsbyjs.netlify.com/packages/gatsby-transformer-sharp#gatsby-transformer-sharp) to handle resizing, cropping, creating responsive images using the [Sharp](https://github.com/lovell/sharp) image processing library.

For allowing other types of files to be used in the gatsby-site, gatsby-source-filesystem needs to be configured in the project itself as well, with path configured to a `static` folder:

```
// gatsby-config.js
  {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/static`,
      },
    },
```
