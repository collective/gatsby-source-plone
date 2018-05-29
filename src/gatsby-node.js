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
  const itemsList = [];
  let data = await fetchData(`${baseUrl}/@search`);

  // Loop through batches of items if number of items > 25
  while (1) {
    itemsList.push(...data.items);

    if (data.batching.next) {
      data = await fetchData(data.batching.next);
    } else {
      break;
    }
  }

  logMessage('Fetching item data', showLogs);
  const items = await Promise.all(
    itemsList.map(async item => {
      const url = item['@id'];
      return await fetchData(url);
    })
  );

  logMessage('Creating node structure', showLogs);
  const nodes = items.map(item => {
    let node = {
      ...item,
      internal: {
        type: item['@type'].startsWith('Plone')
          ? item['@type'].replace(' ', '')
          : 'Plone' + item['@type'].replace(' ', ''),
        contentDigest: createContentDigest(item),
        mediaType: 'text/html',
      },
    };
    node.id = item['@id'];
    node.parent = item.parent['@id'] ? item.parent['@id'] : null;
    node.children = item.items ? item.items.map(item => item['@id']) : [];

    return node;
  });

  // Fetch data, process node for PloneSite
  const ploneSite = await fetchData(baseUrl);
  let ploneSiteNode = {
    ...ploneSite,
    internal: {
      type: 'PloneSite',
      contentDigest: createContentDigest(ploneSite),
      mediaType: 'text/html',
    },
  };
  ploneSiteNode.id = ploneSite['@id'];
  ploneSiteNode.parent = null;
  ploneSiteNode.children = ploneSite.items
    ? ploneSite.items.map(item => item['@id'])
    : [];
  // Push to nodes array
  nodes.push(ploneSiteNode);

  console.log(nodes.length);
  logMessage('Creating nodes', showLogs);
  nodes.map(node => createNode(node));
};
