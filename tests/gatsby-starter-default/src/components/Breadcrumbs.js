import React from 'react';
import Link from 'gatsby-link';

export default ({ data }) =>
  data.parent ? (
    <Link to={`/${data.parent.fields.slug}/`}>&laquo; Return</Link>
  ) : (
    <Link to="/">&laquo; Return</Link>
  );

export const breadcrumbsFragment = graphql`
  fragment Breadcrumbs on PloneFolder {
    fields {
      slug
    }
  }
`;
