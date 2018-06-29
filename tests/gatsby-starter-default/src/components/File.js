import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

export default ({ data }) => (
  <article>
    <Breadcrumbs data={data} />
    <h3>{data.title}</h3>
    <p>
      <strong>{data.description}</strong>
    </p>
    <p>
      <a href={data.file.publicURL} download={data.file.filename}>
        Download
      </a>
    </p>
  </article>
);

export const documentFragment = graphql`
  fragment File on PloneFile {
    id
    title
    description
    file {
      filename
      publicURL
    }
    _components {
      breadcrumbs {
        items {
          _id
          _path
          title
        }
      }
    }
    _path
  }
`;
