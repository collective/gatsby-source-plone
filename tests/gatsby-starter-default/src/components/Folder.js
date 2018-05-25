import React from 'react';
import Link from 'gatsby-link';
import Breadcrumbs from '../components/Breadcrumbs';

export default ({ data }) => (
  <nav>
    <Breadcrumbs data={data} />
    <h3>{data.title}</h3>
    <p>
      <strong>{data.description}</strong>
    </p>
    {data.children.map(child => (
      <article>
        <h4>
          <Link to={`/${child.fields.slug}/`}>{child.title}</Link>
        </h4>
        <p>{child.description}</p>
      </article>
    ))}
  </nav>
);

export const FolderFragment = graphql`
  fragment Folder on PloneFolder {
    id
    title
    description
    parent {
      ...Breadcrumbs
    }
    children {
      ...Document
      ...NewsItem
    }
    fields {
      slug
    }
  }
`;
