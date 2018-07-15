/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allPloneCollection {
        edges {
          node {
            _path
          }
        }
      }
      allPloneDocument {
        edges {
          node {
            _path
          }
        }
      }
      allPloneEvent {
        edges {
          node {
            _path
          }
        }
      }
      allPloneFolder {
        edges {
          node {
            _path
          }
        }
      }
      allPloneNewsItem {
        edges {
          node {
            _path
          }
        }
      }
    }
  `);
  []
    .concat(
      result.data.allPloneCollection.edges,
      result.data.allPloneDocument.edges,
      result.data.allPloneEvent.edges,
      result.data.allPloneFolder.edges,
      result.data.allPloneNewsItem.edges
    )
    .forEach(({ node }) => {
      createPage({
        path: node._path,
        component: path.resolve('./src/templates/default.js'),
      });
    });
};
