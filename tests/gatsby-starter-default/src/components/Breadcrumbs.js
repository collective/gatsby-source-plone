import React from 'react';
import Link from 'gatsby-link';

export default ({ data }) => (
  <nav>
    <ol className={'breadcrumb'}>
      <li className={'breadcrumb-item'}>
        <Link to="/">Home</Link>
      </li>
      {data._components.breadcrumbs.items.map(item =>
        <li key={item._id} className={'breadcrumb-item'}>
          <Link to={`/${item._path}`}>
            {item.title}
          </Link>
        </li>
      )}
    </ol>
  </nav>
);

