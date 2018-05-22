import axios from 'axios';
import crypto from 'crypto';

// Helper to create content digest
const createContentDigest = item =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(item))
    .digest(`hex`);

// Helper to get data from url
const fetchData = async url => {
  const { data } = await axios.get(url, {
    headers: {
      accept: 'application/json',
    },
  });
  return (await Promise.all(
    data.items.map(async item => {
      return await axios.get(item['@id'], {
        headers: {
          accept: 'application/json',
        },
      });
    })
  )).map(item => item.data);
};

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store, cache },
  { baseUrl }
) => {
  const { createNode } = boundActionCreators;

  const data = await fetchData(`${baseUrl}/@search`);

  data.map(item => {
    let node = {
      ...item,
      internal: {
        type: `Plone${item['@type'].replace(' ', '')}`,
        contentDigest: createContentDigest(item),
        mediaType: 'text/html',
      },
    };
    node.id = item['@id'];
    node.parent = null;
    node.children = [];
    createNode(node);
  });
};
