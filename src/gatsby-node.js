import axios from 'axios';
import crypto from 'crypto';
import url from 'url';

// Helper to create content digest
const createContentDigest = item =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(item))
    .digest(`hex`);

// Get URL without expansion parameters
const urlWithoutParameters = url => {
  return url.split('?')[0];
};

// Helper to add token to header if present
const headersWithToken = (headers, token) => {
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

// Helper to add expansions parameters
const urlWithExpansions = (url, expansions) => {
  return expansions
    ? `${url}?expand=${expansions.join()}`
    : `${url}?expand=breadcrumbs,navigation`;
};

// Helper to process data before passing it to nodes
// Replaces `@` to `_` in properties starting with `@`
// to allow it to be queried with GraphQL
const processData = (data, baseUrl) => {
  let node = {};

  Object.entries(data).map(([key, value]) => {
    if (key.startsWith('@')) {
      let updatedValue = {};
      if (key === '@components') {
        Object.entries(value).map(([key, value]) => {
          if (value.items && value.items.length > 0) {
            updatedValue[key] = {
              items: value.items.map(item => ({
                _id: item['@id'],
                _path: item['@id'].split(baseUrl)[1],
                title: item.title,
              })),
            };
          }
        });
      } else {
        updatedValue = value;
      }
      node['_' + key.slice(1)] = updatedValue;
    } else {
      node[key] = value;
    }
  });

  return node;
};

// Helper to get data from url
const fetchData = async (url, token, expansions) => {
  const config = {
    headers: {
      accept: 'application/json',
    },
  };
  config.headers = headersWithToken(config.headers, token);

  const fullUrl = urlWithExpansions(url, expansions);

  const { data } = await axios.get(fullUrl, config);
  return data;
};

// Display logs when showLogs is true
const logMessage = (message, showLogs) => {
  if (showLogs) {
    console.log(message);
  }
};

exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store, cache },
  { baseUrl, token, expansions, showLogs = false }
) => {
  const { createNode } = boundActionCreators;

  logMessage('Fetching URLs', showLogs);
  let itemsList = [];
  let data = await fetchData(`${baseUrl}/@search`, token);

  // Loop through batches of items if number of items > 25
  while (1) {
    itemsList.push(...data.items);

    if (data.batching) {
      if (data.batching.next) {
        data = await fetchData(data.batching.next, token);
      } else break;
    } else {
      break;
    }
  }

  // Filter out Plone site object so that it doesn't get repeated twice
  itemsList = itemsList.filter(item => item['@id'] !== baseUrl);

  logMessage('Fetching item data', showLogs);
  const items = await Promise.all(
    itemsList.map(async item => {
      const url = item['@id'];
      return await fetchData(url, token, expansions);
    })
  );

  logMessage('Creating node structure', showLogs);
  const nodes = items.map(item => {
    let node = {
      internal: {
        type: item['@type'].startsWith('Plone')
          ? item['@type'].replace(' ', '')
          : 'Plone' + item['@type'].replace(' ', ''),
        contentDigest: createContentDigest(item),
        mediaType: 'text/html',
      },
    };

    node = { ...node, ...processData(item, baseUrl) };

    node.id = urlWithoutParameters(item['@id']);
    node.parent = item.parent['@id'] ? item.parent['@id'] : null;
    node.children = item.items ? item.items.map(item => item['@id']) : [];

    return node;
  });

  // Fetch data, process node for PloneSite
  const ploneSite = await fetchData(baseUrl, token, expansions);
  let ploneSiteNode = {
    internal: {
      type: 'PloneSite',
      contentDigest: createContentDigest(ploneSite),
      mediaType: 'text/html',
    },
  };

  ploneSiteNode = { ...ploneSiteNode, ...processData(ploneSite, baseUrl) };

  ploneSiteNode.id = urlWithoutParameters(ploneSite['@id']);
  ploneSiteNode.parent = null;
  ploneSiteNode.children = ploneSite.items
    ? ploneSite.items.map(item => item['@id'])
    : [];
  // Push to nodes array
  nodes.push(ploneSiteNode);

  logMessage('Creating nodes', showLogs);
  nodes.map(node => createNode(node));
};
