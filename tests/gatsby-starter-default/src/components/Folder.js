import React from 'react';
import { graphql, Link } from 'gatsby';

const Folder = ({ data, title }) => (
  <nav key={data._id}>
    <h1>{title ? title : data.title}</h1>
    <p>
      <strong>{data.description}</strong>
    </p>
    <ul className="list-group">
      {data.children.filter(child => child.title).map(child => (
        <li key={child._path} className="list-group-item">
          <p>
            {child.file ? (
              <a href={child.file.publicURL} download={child.file.filename}>
                {child.title}
              </a>
            ) : (
              <Link to={child._path}>{child.title}</Link>
            )}
          </p>
          {child.description ? <p>{child.description}</p> : null}
        </li>
      ))}
    </ul>
  </nav>
);

export default Folder;

export const FolderFragment = graphql`
  fragment PloneSite on PloneSite {
    id
    title
    children {
      ...Document
      ...Folder
      ...NewsItem
    }
    _components {
      navigation {
        items {
          _id
          _path
          title
        }
      }
    }
  }

  fragment Folder on PloneFolder {
    id
    title
    description
    _components {
      breadcrumbs {
        items {
          _id
          _path
          title
        }
      }
    }
    children {
      ...Document
      ...File
      ...NewsItem
      ...SubFolder
      ...File
    }
    _path
  }

  fragment SubFolder on PloneFolder {
    id
    title
    description
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
