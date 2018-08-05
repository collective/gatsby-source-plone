# RichText Component

The [plone.restapi](https://plonerestapi.readthedocs.io/en/latest/) gives stringified HTML content as response in certain content objects. This would include relative internal links, files and images, which need to be processed separately to work properly with Gatsby.

Image and file nodes are backlinked to the object they are present in, and this linking is used to query and process them separately. The plugin also provided serialized React HTML which can be deserialized and displayed in the Gatsby site. All this is coupled together in the `RichText` component.

```javascript
// src/components/RichText.js

import React from 'react';
import { graphql, Link } from 'gatsby';

// Display images with Sharp plugins
import Img from 'gatsby-image';

// Deserialize HTML
import { deserialize } from 'react-serialize';

// Process images
// If image node, use gatsby-image to display content from plugin-sharp
// If external linked image, display the image normally
const ResolveImage = images => data => {
  let byPath = images.reduce(
    (map, image) => map.set(image._path, image),
    new Map()
  );
  if (byPath.get(data.src)) {
    return (
      <Img
        Tag="span"
        resolutions={byPath.get(data.src).image.childImageSharp.fixed}
      />
    );
  } else {
    return <img src={data.src} alt={data.alt} title={data.title} />;
  }
};

// Process files and links
// If file node, get publicURL and create download link
// If internal link, process the href and use gatsby-link
const ResolveLink = files => data => {
  let byPath = files.reduce(
    (map, file) => map.set(file._path, file),
    new Map()
  );
  if (byPath.get(data.to)) {
    return (
      <a
        href={byPath.get(data.to).file.publicURL}
        download={byPath.get(data.to).file.filename}
      >
        {data.children}
      </a>
    );
  } else {
    return <Link to={data.to}>{data.children}</Link>;
  }
};

// Deserialize
// In the process, replace images and links with the function above
const RichText = ({ serialized, images, files }) => (
  <div>
    {deserialize(serialized, {
      components: {
        Link: ResolveLink(files),
        Img: ResolveImage(images),
      },
    })}
  </div>
);

export default RichText;

// These fragments are to be used in the template itself
// to query for images and files separately while
// building pages
export const query = graphql`
  fragment Image on PloneImage {
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

  fragment File on PloneFile {
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
`;
```

```javascript
// src/template/default.js

const componentFor = data => {
  const nodes = query => (query ? query.edges : []).map(edge => edge.node);
  if (data) {
    if (data.ploneCollection) {
      // Images and files are passed in separately
      return (
        <Collection
          data={data.ploneCollection}
          images={nodes(data.allPloneImage)}
          files={nodes(data.allPloneFile)}
        />
      );
    } else if (data.ploneDocument) {
      return (
        <Document
          data={data.ploneDocument}
          images={nodes(data.allPloneImage)}
          files={nodes(data.allPloneFile)}
        />
      );
      // Handle all the other types the same way
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const DefaultLayout = ({ data }) => <Layout>{componentFor(data)}</Layout>;

export default DefaultLayout;

// The File and Image fragments defined in RichText are
// used here to get Image and File data separately
export const query = graphql`
  query DefaultTemplateQuery($path: String!) {
    ploneCollection(_path: { eq: $path }) {
      ...Collection
    }
    ploneDocument(_path: { eq: $path }) {
      ...Document
    }
    ploneEvent(_path: { eq: $path }) {
      ...Event
    }
    ploneFolder(_path: { eq: $path }) {
      ...Folder
    }
    ploneNewsItem(_path: { eq: $path }) {
      ...NewsItem
    }
    allPloneFile(filter: { _backlinks: { eq: $path } }) {
      edges {
        node {
          ...File
        }
      }
    }
    allPloneImage(filter: { _backlinks: { eq: $path } }) {
      edges {
        node {
          ...Image
        }
      }
    }
  }
`;
```

Now that we have it setup, the components for handling types can use it:

```javascript
// src/components/Document.js

import RichText from './RichText';

// data.text indicates an HTML content field here
// data.text.react is serialized data from plugin
// This eliminates the use of dangerouslySetInnerHTML
const Document = ({ data, images = [], files = [] }) => (
  <article key={data._id}>
    <h1>{data.title}</h1>
    {data.text ? (
      <RichText serialized={data.text.react} images={images} files={files} />
    ) : null}
  </article>
);
```

This same code can be reused for all the content types containing HTML fields.
