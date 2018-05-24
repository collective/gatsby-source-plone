import React from 'react';
import Link from 'gatsby-link';

export default ({ data }) => (
  <div>
    {data.allPloneDocument.edges.map(({ node }) => (
      <div>
        <h2>
          <Link to={node.fields.slug}>{node.title}</Link>
        </h2>
      </div>
    ))}
  </div>
);

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
          fields {
            slug
          }
        }
      }
    }
  }
`;
