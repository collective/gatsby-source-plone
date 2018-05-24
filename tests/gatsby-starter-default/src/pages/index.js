import React from 'react';
import Link from 'gatsby-link';

export default ({ data }) => {
  const index = [];
  const contents = [];
  data.allPloneDocument.edges.forEach(({ node }) => {
    if (node.fields.slug === 'index') {
      index.push(
        <div>
          <h2>{node.title}</h2>
          <p>
            <strong>{node.description}</strong>
          </p>
          <div dangerouslySetInnerHTML={{ __html: node.text.data }} />
        </div>
      );
    } else {
      contents.push(
        <h4>
          <Link to={`/${node.fields.slug}/`}>{node.title}</Link>
        </h4>
      );
    }
  });
  return (
    <div>
      {index}
      <h3>Contents</h3>
      <ul>{contents.map(node => <li>{node}</li>)}</ul>
    </div>
  );
};

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
