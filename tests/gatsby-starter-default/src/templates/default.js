import React from 'react';
import { graphql } from 'gatsby';

import Document from '../components/Document';
import Event from '../components/Event';
import Folder from '../components/Folder';
import Layout from '../components/Layout';
import NewsItem from '../components/NewsItem';

const componentFor = data => {
  const nodes = query => (query ? query['edges'] : []).map(edge => edge.node);
  if (data) {
    if (data['ploneCollection']) {
      return (
        <Folder
          data={data['ploneCollection']}
          images={nodes(data['allPloneImage'])}
          files={nodes(data['allPloneFile'])}
        />
      );
    } else if (data['ploneDocument']) {
      return (
        <Document
          data={data['ploneDocument']}
          images={nodes(data['allPloneImage'])}
          files={nodes(data['allPloneFile'])}
        />
      );
    } else if (data['ploneEvent']) {
      return (
        <Event
          data={data['ploneEvent']}
          images={nodes(data['allPloneImage'])}
          files={nodes(data['allPloneFile'])}
        />
      );
    } else if (data['ploneFolder']) {
      return (
        <Folder
          data={data['ploneFolder']}
          images={nodes(data['allPloneImage'])}
          files={nodes(data['allPloneFile'])}
        />
      );
    } else if (data['ploneNewsItem']) {
      return (
        <NewsItem
          data={data['ploneNewsItem']}
          images={nodes(data['allPloneImage'])}
          files={nodes(data['allPloneFile'])}
        />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const DefaultLayout = ({ data }) => (
  <Layout breadcrumbs={data['ploneBreadcrumbs'] || []}>
    {componentFor(data)}
  </Layout>
);

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
    ploneBreadcrumbs(_path: { eq: $path }) {
      items {
        _id
        _path
        title
      }
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
