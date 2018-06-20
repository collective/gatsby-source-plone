import React from 'react';

import Layout from '../components/Layout';
import Document from '../components/Document';
import Folder from '../components/Folder';
import NewsItem from '../components/NewsItem';
import PloneSite from '../components/PloneSite';

const returnTemplate = (data) => {
  if (data) {
    if (data.ploneFolder) {
      return <Folder key={data.ploneFolder.id} data={data.ploneFolder} />;
    } else if (data.ploneDocument) {
      return <Document key={data.ploneDocument.id} data={data.ploneDocument} />;
    } else if (data.ploneNewsItem) {
      return <NewsItem key={data.ploneNewsItem.id} data={data.ploneNewsItem} />;
    } else if (data.ploneSite) {
      return <PloneSite key={data.ploneSite.id} data={data.ploneSite} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default ({ data }) => (
  <Layout>
    {returnTemplate(data)}
  </Layout>
)

export const query = graphql`
  query DefaultTemplateQuery($slug: String!) {
    ploneFolder(_path: { eq: $slug }) {
      ...Folder
    }
    ploneDocument(_path: { eq: $slug }) {
      ...Document
    }
    ploneNewsItem(_path: { eq: $slug }) {
      ...NewsItem
    }
    ploneSite(_path: { eq: $slug }) {
      ...PloneSite
    }
  }
`;
