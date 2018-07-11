import React from 'react';
import { graphql } from 'gatsby';
import RichText from './RichText';

const Document = ({ data, images, files }) => (
  <article key={data._id}>
    <h1>{data.title}</h1>
    {data.description ? (
      <p>
        <strong>{data.description}</strong>
      </p>
    ) : null}
    <RichText serialized={data.text.react} images={images} files={files} />
  </article>
);

export default Document;

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
        fixed(width: 600) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    _path
  }
`;
