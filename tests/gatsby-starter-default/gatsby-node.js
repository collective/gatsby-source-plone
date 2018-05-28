/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');
const config = require('./gatsby-config');

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators;
  const options = config.plugins.filter(
    plugin => plugin.resolve === 'gatsby-source-plone'
  )[0].options;
  if (
    ['PloneFolder', 'PloneDocument', 'PloneNewsItem', 'PloneSite'].includes(
      node.internal.type
    )
  ) {
    const slug = node['@id'].split(options.baseUrl)[1];
    createNodeField({
      node,
      name: 'slug',
      value: slug === '' ? '/' : slug,
    });
  }
};

const pages = ['index']; // reserved manual pages

exports.createPages = async ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  const result = await graphql(`
    {
      allPloneFolder {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
      allPloneDocument {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
      allPloneNewsItem {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
      allPloneSite {
        edges {
          node {
            fields {
              slug
            }
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
    .filter(({ node }) => !pages.includes(node.fields.slug))
    .forEach(({ node }) => {
      console.log(node.fields.slug);
      createPage({
        path: node.fields.slug,
        component: path.resolve('./src/templates/default.js'),
        context: { slug: node.fields.slug }, // 'slug' is graphql variable
      });
    });
};