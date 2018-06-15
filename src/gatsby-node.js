import axios from 'axios';
import crypto from 'crypto';

// Helper to create content digest
const createContentDigest = item =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(item))
    .digest(`hex`);

// Helper to add token to header if present
const headersWithToken = (headers, token) =>
  token ? { ...headers, Authorization: `Bearer ${token}` } : headers;

// Display logs when showLogs is true
const logMessage = (message, showLogs) => {
  if (showLogs) {
    console.log(message);
  }
};

// Helper to process an object of params
// Converts to a string that can be added to a query
// Query format: '?key1=value1&key2=value2'
const processParams = params => {
  if (params) {
    return encodeURIComponent(
      '?' +
        Object.entries(params)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map(v => `${key}=${v}`).join('&');
            } else {
              return `${key}=${value}`;
            }
          })
          .join('&')
    );
  }
  return '';
};

// Helper to add expansions parameters
const urlWithExpansions = (url, expansions) => {
  return encodeURIComponent(
    expansions
      ? `${url}?expand=${expansions.join()}`
      : `${url}?expand=breadcrumbs,navigation`
  );
};

// Helper to get URL without expansion parameters
const urlWithoutParameters = url => {
  return url.split('?')[0];
};

// Fetch data from a url
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

// Fetch data of all items traversing through batches
const fetchAllItems = async (baseUrl, token, searchParams) => {
  let itemsList = [];
  let data = await fetchData(
    `${baseUrl}/@search${processParams(searchParams)}`,
    token
  );

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

  return itemsList;
};

// Process data to pass it on to nodes
const processData = (data, baseUrl) => {
  let node = {
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'text/html',
    },
  };

  // Check if Plone Site node
  if (data['@id'] === baseUrl) {
    node.internal.type = 'PloneSite';
  } else {
    node.internal.type = data['@type'].startsWith('Plone')
      ? data['@type'].replace(' ', '')
      : 'Plone' + data['@type'].replace(' ', '');
  }

  // Replaces `@` to `_` in properties starting with `@`
  // to allow it to be queried with GraphQL
  Object.entries(data).map(([key, value]) => {
    if (key.startsWith('@')) {
      let updatedValue = {};
      if (key === '@components') {
        Object.entries(value).map(([key, value]) => {
          if (value.items && value.items.length > 0) {
            updatedValue[key] = {
              items: value.items.map(item => ({
                _id: item['@id'],
                _path:
                  '/' + urlWithoutParameters(item['@id']).split(baseUrl)[1],
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

  // Add node _path variable to be used similar to slug
  node._path = '/' + urlWithoutParameters(data['@id']).split(baseUrl)[1];

  // Tree hierarchy in nodes
  node.id = urlWithoutParameters(data['@id']);
  node.parent = data.parent['@id'] ? data.parent['@id'] : null;
  node.children = data.items ? data.items.map(item => item['@id']) : [];

  return node;
};

// SEARCH TRAVERSAL ALGORITHM
const processNodesUsingSearchTraversal = async (
  baseUrl,
  token,
  expansions,
  searchParams,
  showLogs
) => {
  logMessage('Fetching URLs', showLogs);
  let itemsList = await fetchAllItems(baseUrl, token, searchParams);

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
    return processData(item, baseUrl);
  });

  // Fetch data, process node for PloneSite
  const ploneSite = await fetchData(baseUrl, token, expansions);
  const ploneSiteNode = processData(ploneSite, baseUrl);
  // Push to nodes array
  nodes.push(ploneSiteNode);

  return nodes;
};

// BFS RECURSIVE ALGORITHM
const processNodesUsingRecursion = async (
  baseUrl,
  token,
  expansions,
  showLogs
) => {
  let nodes = [];
  const queue = [baseUrl];

  logMessage('Traversing the site and fetching data', showLogs);
  while (queue.length > 0) {
    const url = queue.shift();
    const itemData = await fetchData(url, token, expansions);

    const children = itemData.items
      ? itemData.items.map(item => item['@id'])
      : [];
    queue.push(...children);

    nodes.push(processData(itemData, baseUrl));
  }

  return nodes;
};

// Main function
exports.sourceNodes = async (
  { boundActionCreators },
  { baseUrl, token, expansions, searchParams, showLogs = false }
) => {
  const { createNode } = boundActionCreators;
  let nodes = [];

  // @search approach if searchParams present
  if (searchParams) {
    nodes = await processNodesUsingSearchTraversal(
      baseUrl,
      token,
      expansions,
      searchParams,
      showLogs
    );
  } else {
    // Recursive approach
    nodes = await processNodesUsingRecursion(
      baseUrl,
      token,
      expansions,
      showLogs
    );
  }

  logMessage('Creating nodes', showLogs);
  nodes.map(node => createNode(node));
};
