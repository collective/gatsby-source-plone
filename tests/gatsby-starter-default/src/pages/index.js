import React from 'react';
import Link from 'gatsby-link';

const IndexPage = ({ data }) => (
  <div>
    {data.allPloneDocument.edges.map(({ node }) => (
      <div>
        <h3>{node.title}</h3>
        <h4>{node.description}</h4>
        <div dangerouslySetInnerHTML={{ __html: node.text.data }} />
      </div>
    ))}
  </div>
);

export default IndexPage;

// Set here the ID of the home page.
export const pageQuery = graphql`
  query IndexPageQuery {
    allPloneDocument {
      edges {
        node {
          id
          title
          description
          text {
            data
          }
        }
      }
    }
  }
`;
