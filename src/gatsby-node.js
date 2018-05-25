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

// Display logs when showLogs is true
const logMessage = (message, show) => {
  show && console.log(message);
};

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store, cache },
  { baseUrl, showLogs = false }
) => {
  const { createNode } = boundActionCreators;

  logMessage('Fetching URLs', showLogs);
  const data = await fetchData(`${baseUrl}/@search`);

  logMessage('Fetching item data', showLogs);
  const items = await Promise.all(
    data.items.map(async item => {
      const url = item['@id'];
      return await fetchData(url);
    })
  );

  logMessage('Creating node structure', showLogs);
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
    node.parent = item.parent['@id'] ? item.parent['@id'] : null;
    node.children = item.items ? item.items.map(item => item['@id']) : [];

    return node;
  });

  logMessage('Creating nodes', showLogs);
  nodes.map(node => createNode(node));
};
