import React from 'react';
import { Link } from 'gatsby';

export default ({ data }) => {
  const index = [];
  const contents = [];
  data.children.forEach(child => {
    if (child._path === '/index') {
      index.push(
        <div>
          <h2>{child.title}</h2>
          <p>
            <strong>{child.description}</strong>
          </p>
          <div dangerouslySetInnerHTML={{ __html: child.text.data }} />
        </div>
      );
    } else {
      contents.push(
        <h4>
          <Link to={child._path}>{child.title}</Link>
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

export const plonSiteFragment = graphql`
  fragment PloneSite on PloneSite {
    id
    title
    children {
      ...Document
      ...Folder
      ...NewsItem
    }
  }
`;
