import React from 'react';
import Document from '../components/Document';
import Folder from '../components/Folder';
import NewsItem from '../components/NewsItem';

export default ({ data }) => {
  if (data.ploneFolder) {
    return <Folder key={data.ploneFolder.id} data={data.ploneFolder} />;
  } else if (data.ploneDocument) {
    return <Document key={data.ploneDocument.id} data={data.ploneDocument} />;
  } else if (data.ploneNewsItem) {
    return <NewsItem key={data.ploneNewsItem.id} data={data.ploneNewsItem} />;
  } else {
    return null;
  }
};

export const query = graphql`
  query DefaultTemplateQuery($slug: String!) {
    ploneFolder(fields: { slug: { eq: $slug } }) {
      ...Folder
    }
    ploneDocument(fields: { slug: { eq: $slug } }) {
      ...Document
    }
    ploneNewsItem(fields: { slug: { eq: $slug } }) {
      ...NewsItem
    }
  }
`;
