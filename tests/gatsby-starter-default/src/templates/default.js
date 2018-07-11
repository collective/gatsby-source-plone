import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import Document from '../components/Document';
import Folder from '../components/Folder';
import NewsItem from '../components/NewsItem';

const componentFor = data => {
  if (data) {
    if (data.ploneFolder) {
      return (
        <Folder
          data={data.ploneFolder}
          images={data.allPloneImage}
          files={data.allPloneFile}
        />
      );
    } else if (data.ploneDocument) {
      return (
        <Document
          data={data.ploneDocument}
          images={data.allPloneImage}
          files={data.allPloneFile}
        />
      );
    } else if (data.ploneNewsItem) {
      return (
        <NewsItem
          data={data.ploneNewsItem}
          images={data.allPloneImage}
          files={data.allPloneFile}
        />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default ({ data }) => <Layout>{componentFor(data)}</Layout>;

export const query = graphql`
  query DefaultTemplateQuery($path: String!) {
    ploneFolder(_path: { eq: $path }) {
      ...Folder
    }
    ploneDocument(_path: { eq: $path }) {
      ...Document
    }
    ploneNewsItem(_path: { eq: $path }) {
      ...NewsItem
    }
    ploneSite(_path: { eq: $path }) {
      ...PloneSite
    }
    allPloneImage(filter: { _backlinks: { eq: $path } }) {
      edges {
        node {
          ...Image
        }
      }
    }
    allPloneFile(filter: { _backlinks: { eq: $path } }) {
      edges {
        node {
          ...File
        }
      }
    }
  }
`;
