/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators;
  if (node.internal.type === `PloneDocument`) {
    const parts = node['@id'].split(/[\/,]+/);
    const slug = parts[parts.length - 1];
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};

const blacklist = ['index'];

exports.createPages = async ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  const result = await graphql(`
    {
      allPloneDocument {
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
  result.data.allPloneDocument.edges
    .filter(({ node }) => !blacklist.includes(node.fields.slug))
    .forEach(({ node }) => {
      createPage({
        path: node.fields.slug,
        component: path.resolve(`./src/templates/page.js`),
        context: {
          // Data passed to context is available in page queries as GraphQL variables.
          slug: node.fields.slug,
        },
      });
    });
};
