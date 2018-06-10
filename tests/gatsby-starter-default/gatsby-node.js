/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');

const pages = ['/index']; // reserved manual pages

exports.createPages = async ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  const result = await graphql(`
    {
      allPloneFolder {
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
      allPloneNewsItem {
        edges {
          node {
            _path
          }
        }
      }
      allPloneSite {
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
      result.data.allPloneFolder.edges,
      result.data.allPloneDocument.edges,
      result.data.allPloneNewsItem.edges,
      result.data.allPloneSite.edges
    )
    .filter(({ node }) => !pages.includes(node._path))
    .forEach(({ node }) => {
      createPage({
        path: node._path,
        component: path.resolve('./src/templates/default.js'),
        context: { slug: node._path }, // slug is a GraphQL variable
      });
    });
};