import React from 'react';

export default ({ data }) => {
  // TODO: Fix issue when generated page has id 'slug' is 'index',
  // because now we get the graphql results from pages/index
  const page = data.ploneDocument || data.allPloneDocument.edges[0].node;
  return (
    <div>
      <h3>{page.title}</h3>
      <h4>{page.description}</h4>
      <div dangerouslySetInnerHTML={{ __html: page.text.data }} />
    </div>
  );
};

export const query = graphql`
  query PloneDocumenQuery($slug: String!) {
    ploneDocument(fields: { slug: { eq: $slug } }) {
      title
      description
      text {
        data
      }
    }
  }
`;
