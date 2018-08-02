import React from 'react';
import Img from 'gatsby-image';
import { graphql } from 'gatsby';
import RichText from './RichText';

const NewsItem = ({ data, images, files }) => (
  <article key={data._id}>
    <h1>{data.title}</h1>
    <Img resolutions={data.image.childImageSharp.fixed} />
    <p>
      <small>
        Published on <em>{data.effective}</em>
      </small>
    </p>
    {data.description ? (
      <p>
        <strong>{data.description}</strong>
      </p>
    ) : null}
    <RichText serialized={data.text.react} images={images} files={files} />
  </article>
);

export default NewsItem;

export const query = graphql`
  fragment NewsItem on PloneNewsItem {
    id
    title
    description
    effective(formatString: "MMMM Do, YYYY")
    image {
      childImageSharp {
        fixed(width: 200) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    text {
      react
    }
    _path
  }
`;
