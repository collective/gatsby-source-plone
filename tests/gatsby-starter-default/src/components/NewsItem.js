import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import Img from 'gatsby-image';

export default ({ data }) => (
  <article>
    <Breadcrumbs data={data} />
    <h3>{data.title}</h3>
    <Img resolutions={data.localFile.childImageSharp.resolutions} />
    <p>
      <small>
        Published <em>{data.effective}</em>
      </small>
    </p>
    <p>
      <strong>{data.description}</strong>
    </p>
    <div dangerouslySetInnerHTML={{ __html: data.text.data }} />
  </article>
);

export const newsItemFragment = graphql`
  fragment NewsItem on PloneNewsItem {
    id
    title
    description
    effective
    localFile {
      childImageSharp {
        resolutions(width: 125, height: 125) {
          ...GatsbyImageSharpResolutions
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
      data
    }
    _path
  }
`;
