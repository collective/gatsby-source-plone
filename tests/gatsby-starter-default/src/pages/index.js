import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/Layout';
import Document from '../components/Document';
import Folder from '../components/Folder';

const IndexPage = ({ data }) => (
  <Layout>
    <Document data={data.ploneDocument} />
    <Folder data={data.ploneSite} title="Contents" />
  </Layout>
);

export default IndexPage;

export const query = graphql`
  query IndexPageQuery {
    ploneDocument(_path: { eq: "/docs/index/" }) {
      ...Document
    }
    ploneSite(_path: { eq: "/" }) {
      ...PloneSite
    }
  }
`;
