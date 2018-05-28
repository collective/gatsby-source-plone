import React from 'react';

export default ({ data }) => (
  <div>
    <h2>{data.title}</h2>
    <ul>{data.items.map(item => <li>{item.title}</li>)}</ul>
  </div>
);

export const ploneSiteFragment = graphql`
  fragment PloneSite on PloneSite {
    title
    items {
      title
    }
  }
`;
