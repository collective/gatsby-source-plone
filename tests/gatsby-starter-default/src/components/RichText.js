import React from 'react';
import { graphql, Link } from 'gatsby';
import Img from 'gatsby-image';
import { deserialize } from 'react-serialize';

const ResolveImage = images => data => {
  let byPath = images.reduce(function(result, image) {
    result[image._path] = image;
    return result;
  }, {});
  if (byPath[data.src]) {
    return (
      <Img
        Tag="span"
        resolutions={byPath[data.src].image.childImageSharp.fixed}
      />
    );
  } else {
    return <img src={data.src} alt={data.alt} title={data.title} />;
  }
};

const ResolveLink = files => data => {
  let byPath = files.reduce(function(result, file) {
    result[file._path] = file;
    return result;
  }, {});
  if (byPath[data.to]) {
    return (
      <a
        href={byPath[data.to].file.publicURL}
        download={byPath[data.to].file.filename}
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
