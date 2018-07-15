import React from 'react';
import { graphql, Link } from 'gatsby';

const Folder = ({ data, title }) => (
  <nav key={data._id}>
    <h1>{title ? title : data.title}</h1>
    <p>
      <strong>{data.description}</strong>
    </p>
    <ul className="list-group">
      {data.children
        .filter(child => child.title && child._path !== '/docs/index/')
        .map(child => (
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

export const query = graphql`
  fragment Site on PloneSite {
    id
    title
    _components {
      navigation {
        items {
          _id
          _path
          title
        }
      }
    }
    children {
      ...Collection
      ...Document
      ...Event
      ...File
      ...Folder
      ...NewsItem
    }
    _path
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
      ...Collection
      ...Document
      ...Event
      ...File
      ...NewsItem
      ...SubFolder
    }
    _path
  }

  fragment SubFolder on PloneFolder {
    id
    title
    description
    _path
  }
`;
