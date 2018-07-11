import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { graphql, Link } from 'gatsby';
import Img from 'gatsby-image';

import { deserialize } from 'react-serialize';

const ResolveImage = images => data => {
  if (images && images.edges) {
    let match = images.edges.filter(edge => edge.node._path === data.src);
    if (match.length) {
      return (
        <Img
          Tag="span"
          resolutions={match[0].node.image.childImageSharp.fixed}
        />
      );
    }
  }
  return <img src={data.src} alt={data.alt} title={data.title} />;
};

const ResolveLink = files => data => {
  if (files && files.edges) {
    let match = files.edges.filter(edge => edge.node._path === data.to);
    if (match.length) {
      return (
        <a
          href={match[0].node.file.publicURL}
          download={match[0].node.file.filename}
        >
          {data.children}
        </a>
      );
    }
  }
  return <Link to={data.to}>{data.children}</Link>;
};

export default ({ data, images, files }) => (
  <article>
    <Breadcrumbs data={data} />
    <h3>{data.title}</h3>
    <p>
      <strong>{data.description}</strong>
    </p>
    <div>
      {deserialize(data.text.react, {
        components: {
          Link: ResolveLink(files),
          Img: ResolveImage(images),
        },
      })}
    </div>
  </article>
);

export const documentFragment = graphql`
  fragment Document on PloneDocument {
    id
    title
    description
    _components {
      breadcrumbs {
        items {
          _id
          _path
          title
        }
      }
    }
    text {
      react
    }
    _path
  }

  fragment Image on PloneImage {
    id
    title
    image {
      publicURL
      childImageSharp {
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    _path
  }
`;
