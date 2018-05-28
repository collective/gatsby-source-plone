import React from 'react';
import Link from 'gatsby-link';

export default ({ data }) => {
  const index = [];
  const contents = [];
  data.children.forEach(child => {
    if (child.fields.slug === 'index') {
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
          <Link to={`/${child.fields.slug}/`}>{child.title}</Link>
        </h4>
      )
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
