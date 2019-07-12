import React from 'react';
import { graphql, Link } from 'gatsby';
import Img from 'gatsby-image';
import { deserialize } from 'react-serialize';

const ResolveImage = images => data => {
  let byPath = images.reduce(
    (map, image) => map.set(image._path, image),
    new Map()
  );
  if (byPath.get(data.src)) {
    return (
      <Img
        Tag="span"
        resolutions={byPath.get(data.src).image.childImageSharp.fixed}
      />
    );
  } else {
    return <img src={data.src} alt={data.alt} title={data.title} />;
  }
};

const ResolveLink = files => data => {
  let byPath = files.reduce(
    (map, file) => map.set(file._path, file),
    new Map()
  );
  if (byPath.get(data.to)) {
    return (
      <a
        href={byPath.get(data.to).file.publicURL}
        download={byPath.get(data.to).file.filename}
      >
        {data.children}
      </a>
    );
  } else {
    return <Link to={data.to}>{data.children}</Link>;
  }
};

const RichText = ({ serialized, images, files }) => (
  <div>
    {deserialize(serialized, {
      components: {
        Link: ResolveLink(files),
        Img: ResolveImage(images),
      },
    })}
  </div>
);

export default RichText;

export const query = graphql`
  fragment Image on PloneImage {
    id
    title
    image {
      publicURL
      childImageSharp {
        fixed(width: 600) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    _path
  }

  fragment File on PloneFile {
    id
    title
    description
    file {
      filename
      publicURL
    }
    _type
    _path
  }
`;
