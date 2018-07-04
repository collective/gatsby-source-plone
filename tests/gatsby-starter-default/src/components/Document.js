import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

import { deserialize } from 'react-serialize';

export default ({ data }) => (
  <article>
    <Breadcrumbs data={data} />
    <h3>{data.title}</h3>
    <p>
      <strong>{data.description}</strong>
    </p>
    <div>{deserialize(data.text.react)}</div>
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
`;
