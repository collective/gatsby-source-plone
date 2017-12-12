"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var axios = require("axios");
var crypto = require("crypto");

exports.sourceNodes = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref, _ref2) {
    var boundActionCreators = _ref.boundActionCreators,
        getNode = _ref.getNode,
        hasNodeChanged = _ref.hasNodeChanged,
        store = _ref.store,
        cache = _ref.cache;
    var baseUrl = _ref2.baseUrl;
    var createNode, data;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            createNode = boundActionCreators.createNode;
            _context2.next = 3;
            return axios.get("http://localhost:8080/Plone/@search", {
              params: {
                metadata_fields: "_all"
              },
              headers: {
                accept: "application/json"
              }
            });

          case 3:
            data = _context2.sent;

            data.data.items.map(function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(item) {
                var node;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        node = _extends({}, item, {
                          internal: {
                            type: item["@type"].replace(" ", ""),
                            contentDigest: crypto.createHash("md5").update(JSON.stringify(item)).digest("hex")
                          }
                        });

                        node.id = item["@id"];
                        node.parent = null;
                        node.children = [];
                        createNode(node);

                      case 5:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x3) {
                return _ref4.apply(this, arguments);
              };
            }());

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

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();

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