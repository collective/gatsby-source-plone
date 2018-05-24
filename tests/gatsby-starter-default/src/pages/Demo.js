import React from 'react';
import NewsItem from '../components/NewsItem';

export default ({ data }) => (
  <div>
    <h1>Demo</h1>
    {data.ploneFolder.children.map(child => (
      <NewsItem key={child.id} data={child} />
    ))}
  </div>
);

// Set here the ID of the home page.
export const pageQuery = graphql`
  query DemoPageQuery {
    ploneFolder (title: {eq: "Demo"}) {
      children {
        ...NewsItem
      }
    }
  }
`;
