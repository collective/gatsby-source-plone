import React from 'react';
import { graphql, Link } from 'gatsby';
import RichText from './RichText';

const Folder = ({ data, title, images = [], files = [] }) => {
  const listedTypes = new Set([
    'Document',
    'Folder',
    'News Item',
    'Event',
    'Collection',
    'File',
  ]);
  let byPath = files.reduce(function(result, file) {
    result[file._path] = file;
    return result;
  }, {});
  return (
    <nav key={data._id}>
      <h1>{title ? title : data.title}</h1>
      <p>
        <strong>{data.description}</strong>
      </p>
      {data.text ? (
        <RichText serialized={data.text.react} images={images} files={files} />
      ) : null}
      <ul className="list-group">
        {data.items
          .filter(
            item => listedTypes.has(item._type) && item._path !== '/docs/index/'
          )
          .map(item => (
            <li key={item._path} className="list-group-item">
              <p>
                {byPath[item._path] ? (
                  <a
                    href={byPath[item._path].file.publicURL}
                    download={byPath[item._path].file.filename}
                  >
                    {item.title}
                  </a>
                ) : (
                  <Link to={item._path}>{item.title}</Link>
                )}
              </p>
              {item.description ? <p>{item.description}</p> : null}
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default Folder;

export const query = graphql`
  fragment Site on PloneSite {
    id
    title
    items {
      _id
      _path
      _type
      description
      title
    }
    _path
  }

  fragment Folder on PloneFolder {
    id
    title
    description
    items {
      _id
      _path
      _type
      description
      title
    }
    _path
  }
`;
