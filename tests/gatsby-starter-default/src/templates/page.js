import React from 'react';

export default ({ data }) => {
  const node = data.ploneDocument;
  return (
    <div>
      <h2>{node.title}</h2>
      <p>
        <strong>{node.description}</strong>
      </p>
      <div dangerouslySetInnerHTML={{ __html: node.text.data }} />
    </div>
  );
};

export const query = graphql`
  query PloneDocumentQueryForPages($slug: String!) {
    ploneDocument(fields: { slug: { eq: $slug } }) {
      title
      description
      text {
        data
      }
    }
  }
`;
