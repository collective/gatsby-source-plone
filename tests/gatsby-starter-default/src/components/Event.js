import React from 'react';
import { graphql } from 'gatsby';
import RichText from './RichText';

const Event = ({ data, images, files }) => (
  <article key={data._id}>
    <h1>{data.title}</h1>
    <p>
      <small>
        Begins <em>{data.start}</em>
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

export default Event;

export const query = graphql`
  fragment Event on PloneEvent {
    id
    title
    description
    start(formatString: "MMMM Do, YYYY @ HH:MM")
    text {
      react
    }
    _path
  }
`;
