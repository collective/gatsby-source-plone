import React from 'react';
import { graphql } from 'gatsby';

import Document from '../components/Document';
import Event from '../components/Event';
import Folder from '../components/Folder';
import Layout from '../components/Layout';
import NewsItem from '../components/NewsItem';

const componentFor = data => {
  if (data) {
    if (data.ploneCollection) {
      return (
        <Folder
          data={data.ploneCollection}
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
    } else if (data.ploneEvent) {
      return (
        <Event
          data={data.ploneEvent}
          images={data.allPloneImage}
          files={data.allPloneFile}
        />
      );
    } else if (data.ploneFolder) {
      return (
        <Folder
          data={data.ploneFolder}
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

const DefaultLayout = ({ data }) => <Layout>{componentFor(data)}</Layout>;

export default DefaultLayout;

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
