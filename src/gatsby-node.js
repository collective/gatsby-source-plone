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
  return data;
};

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store, cache },
  { baseUrl }
) => {
  const { createNode } = boundActionCreators;

  console.log('Fetching URLs');
  const data = await fetchData(`${baseUrl}/@search`);

  console.log('Fetching item data');
  const items = await Promise.all(
    data.items.map(async item => {
      const url = item['@id'];
      return await fetchData(url);
    })
  );

  console.log('Creating node structure');
  const nodes = items.map(item => {
    let node = {
      ...item,
      internal: {
        type: 'Plone' + item['@type'].replace(' ', ''),
        contentDigest: createContentDigest(item),
        mediaType: 'text/html',
      },
    };
    node.id = item['@id'];
    node.parent = null;
    node.children = [];

    return node;
  });

  console.log('Creating nodes');
  nodes.map(node => createNode(node));
};
