import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Img from 'gatsby-image';
import { Link } from 'gatsby';

import { deserialize } from 'react-serialize';

export default ({ data }) => (
  <article>
    <Breadcrumbs data={data} />
    <h3>{data.title}</h3>
    <Img resolutions={data.image.childImageSharp.fixed} />
    <p>
      <small>
        Published on <em>{data.effective}</em>
      </small>
    </p>
    <p>
      <strong>{data.description}</strong>
    </p>
    <div>
      {deserialize(data.text.react, {
        components: {
          Link,
        },
      })}
    </div>
  </article>
);

export const newsItemFragment = graphql`
  fragment NewsItem on PloneNewsItem {
    id
    title
    description
    effective(formatString: "MMMM Do, YYYY")
    image {
      childImageSharp {
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    _components {
      breadcrumbs {
        items {
          _id
          _path
          title
        }
      }
    }
    text {
      react
    }
    _path
  }
`;
