import React from 'react';
import { graphql } from 'gatsby';
import Folder from './Folder';

const Collection = ({ data, title }) => <Folder data={data} title={title} />;

export default Collection;

export const query = graphql`
  fragment Collection on PloneCollection {
    id
    title
    description
    text {
      react
    }
    items {
      _id
      _path
      _type
      description
      title
    }
    _path
  }
`;
