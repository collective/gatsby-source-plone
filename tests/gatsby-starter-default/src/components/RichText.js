import React from 'react';
import { Link } from 'gatsby';
import Img from 'gatsby-image';
import { deserialize } from 'react-serialize';

const ResolveImage = images => data => {
  if (images && images.edges) {
    let match = images.edges.filter(edge => edge.node._path === data.src);
    if (match.length) {
      return (
        <Img
          Tag="span"
          resolutions={match[0].node.image.childImageSharp.fixed}
        />
      );
    }
  }
  return <img src={data.src} alt={data.alt} title={data.title} />;
};

const ResolveLink = files => data => {
  if (files && files.edges) {
    let match = files.edges.filter(edge => edge.node._path === data.to);
    if (match.length) {
      return (
        <a
          href={match[0].node.file.publicURL}
          download={match[0].node.file.filename}
        >
          {data.children}
        </a>
      );
    }
  }
  return <Link to={data.to}>{data.children}</Link>;
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
