const axios = require(`axios`);
const crypto = require(`crypto`);

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store, cache },
  { baseUrl }
) => {
  const { createNode } = boundActionCreators;

  const data = await axios.get("http://localhost:8080/Plone/@search", {
    params: {
      metadata_fields: "_all"
    },
    headers: {
      accept: "application/json"
    }
  });
  data.data.items.map(async item => {
    let node = {
      ...item,
      internal: {
        type: item["@type"].replace(" ", ""),
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(item))
          .digest(`hex`)
      }
    };
    node.id = item["@id"];
    node.parent = null;
    node.children = [];
    createNode(node);
  });

  // const data = await axios.get("http://localhost:8080/Plone/news/aggregator", {
  //   headers: {
  //     accept: "application/json"
  //   }
  // });
  // const news = await Promise.all(
  //   data.data.items.map(async item => {
  //     const url = item["@id"];
  //     const getNext = async url => {
  //       const res = await axios.get(url, {
  //         headers: {
  //           accept: "application/json"
  //         }
  //       });
  //       return res.data;
  //     };
  //
  //     const itemDetails = await getNext(url);
  //
  //     let node = {
  //       ...itemDetails,
  //       slug: `/${itemDetails.id}/`,
  //       internal: {
  //         type: "NewsItem",
  //         contentDigest: crypto
  //           .createHash(`md5`)
  //           .update(JSON.stringify(itemDetails))
  //           .digest(`hex`)
  //       }
  //     };
  //     node.id = itemDetails.UID;
  //     node.parent = null;
  //     node.children = [];
  //     return node;
  //   })
  // );
  // news.map(x => createNode(x));
};

// exports.createPages = ({ graphql, boundActionCreators }) => {
//   const { createPage } = boundActionCreators;
//   return new Promise((resolve, reject) => {
//     graphql(`
//       {
//         allNewsItem {
//           edges {
//             node {
//               id
//               slug
//             }
//           }
//         }
//       }
//     `).then(result => {
//       result.data.allNewsItem.edges.map(({ node }) => {
//         createPage({
//           path: node.slug,
//           component: path.resolve(`./src/templates/news-item.js`),
//           context: {
//             // Data passed to context is available in page queries as GraphQL variables.
//             id: node.id
//           }
//         });
//       });
//       resolve();
//     });
//   });
// };
