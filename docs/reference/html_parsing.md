# RichText field support

**Note:** In time of writing, this plugin only supported RichText fields named `text`.

HTML content from the [plone.restapi](https://github.com/plone/plone.restapi) is returned as string of HTML. Using a combination of [react-html-parser](url) and [react-serialize](url), this HTML content is processed into React nodes.

## RichText Component

It deserializes the React nodes field which was processed by the plugin to be used in the component and also handles images, files and relative links. Using backlinks, images and files are queried separately and passed into the RichText componoent and it replaces the `img` and `a` tags with updated data, in the case of relative links, it even replaces it with `Img` or `Link` tags respectively.

## Parsing process

`react-html-parser` is used to parse the HTML string into React nodes, it is then serialized by `react-serialize` so that it can be passed into and retrieved via GraphQL queries. In this process of parsing, backlinks and relative links are configured, and in the gatsby-site, RichText component is used to handle deserialization and displaying images, files and so on.

## Backlinks

Backlinks provide an optimized way to get the relevant images and files for a certain component. It's basically an object with stores a list of nodes to which a certain file/image is relevant to. This eliminates the need for iterating every single image and file to replace the `a` or `img` tag with.

Taking the case of the `./demo`:

- In default layout, we find node for matching path and render it with a proper component, and also pass the component all related images and files
- in RichText component (called from Document or NewsItem) we use that data to replace links to files and images with optimized gatsby-images
