/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');
const graphql = require(`gatsby/graphql`);
const fs = require(`fs-extra`);

// TODO: This should be included from gatsby-source-filesystem/extend-file-node
exports.setFieldsOnGraphQLNodeType = async ({
  type,
  getNodeAndSavePathDependency,
  pathPrefix = ``,
}) => {
  if (type.name !== `File`) {
    return {};
  }

  return Promise.resolve({
    publicURL: {
      type: graphql.GraphQLString,
      args: {},
      description: `Copy file to static directory and return public url to it`,
      resolve: (file, fieldArgs, context) => {
        const details = getNodeAndSavePathDependency(file.id, context.path);
        const fileName = `${file.name}-${file.internal.contentDigest}${
          details.ext
        }`;
        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static`,
          fileName
        );

        if (!fs.existsSync(publicPath)) {
          fs.copy(details.absolutePath, publicPath, err => {
            if (err) {
              console.error(
                `error copying file from ${
                  details.absolutePath
                } to ${publicPath}`,
                err
              );
            }
          });
        }
        return `${pathPrefix}/static/${fileName}`;
      },
    },
  });
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

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
      allPloneFile {
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
    .forEach(({ node }) => {
      createPage({
        path: node._path,
        component: path.resolve('./src/templates/default.js'),
      });
    });
};
