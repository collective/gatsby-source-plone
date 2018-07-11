import axios from 'axios';
import { createRemoteFileNode } from 'gatsby-source-filesystem';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { serialize } from 'react-serialize';

import {
  createContentDigest,
  headersWithToken,
  logMessage,
  urlWithoutParameters,
  normalizePath,
} from './normalize';

// Fetch data from a url
const fetchData = async (url, token, expansions, searchParams) => {
  const config = {
    headers: {
      accept: 'application/json',
    },
    params: { ...searchParams },
  };
  config.headers = headersWithToken(config.headers, token);

  if (expansions) {
    config.params.expand = expansions.join();
  }

  const { data } = await axios.get(url, config);
  return data;
};

// Fetch data of all items traversing through batches
const fetchAllItems = async (url, token, searchParams) => {
  let itemsList = [];
  let data = await fetchData(url, token, undefined, searchParams);

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

// Process HTML data using react-html-parser
const processHtml = (html, baseUrl, path, backlinks) => {
  const transform = (node, index) => {
    // Replace hyperlinks with relative links
    if (node.type === 'tag' && node.name === 'a') {
      if (node.attribs.href && node.attribs.href.startsWith(baseUrl)) {
        node.attribs.to = normalizePath(node.attribs.href.split(baseUrl)[1]);
        node.attribs.href = null;
        node.name = 'Link';
        if (!backlinks[node.attribs.to]) {
          backlinks[node.attribs.to] = [path];
        } else {
          backlinks[node.attribs.to].push(path);
        }
        return convertNodeToElement(node, index, transform);
      }
    }

    // Replace image src with relative paths
    if (node.type === 'tag' && node.name === 'img') {
      if (node.attribs.src && node.attribs.src.startsWith(baseUrl)) {
        node.attribs.src = normalizePath(
          node.attribs.src.split(baseUrl)[1].split('/@@images')[0]
        );
        node.name = 'Img';
        if (!backlinks[node.attribs.src]) {
          backlinks[node.attribs.src] = [path];
        } else {
          backlinks[node.attribs.src].push(path);
        }
        return convertNodeToElement(node, index, transform);
      }
    }
  };

  const options = {
    decodeEntities: true,
    transform,
  };

  return serialize(ReactHtmlParser(html, options));
};

// Process data to pass it on to nodes
const processData = async (data, baseUrl, backlinks, token) => {
  let node = {
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'text/html',
    },
  };

  // Check if Plone Site node
  if (urlWithoutParameters(data['@id']) === baseUrl) {
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
                _path: normalizePath(
                  urlWithoutParameters(item['@id']).split(baseUrl)[1]
                ),
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
  node._path = normalizePath(
    urlWithoutParameters(data['@id']).split(baseUrl)[1]
  );

  // Add array of backlinks
  if (!backlinks[node._path]) {
    backlinks[node._path] = node._backlinks = []; // create new container
  } else {
    node._backlinks = backlinks[node._path]; // merge with found backlinks
  }

  // Transform HTML string into serialized React tree
  if (node.text) {
    if (node.text['content-type'] === 'text/html') {
      node.text.react = processHtml(
        node.text.data,
        baseUrl,
        node._path,
        backlinks
      );
    }
  }

  // Tree hierarchy in nodes
  node.id = urlWithoutParameters(data['@id']);
  node.parent = data.parent['@id'] ? data.parent['@id'] : null;

  // Process children items, considering case of batching
  if (node.batching) {
    const allItems = await fetchAllItems(node.id, token);
    node.children = allItems.map(item => item['@id']);
  } else {
    node.children = data.items ? data.items.map(item => item['@id']) : [];
  }

  return node;
};

// Handle file nodes
const processFileNodes = async (nodes, store, cache, createNode) => {
  const updatedNodes = await Promise.all(
    nodes.map(async node => {
      let imageNode, fileNode;

      // Wrapper function for createNode
      // Adds 'png' extension to node so that gatsby-tranform-sharp recognizes it
      // Also, appends existing node.image data along with fileNode data
      const createImageNode = async (fileNode, source) => {
        createNode({ ...fileNode, ...node.image, extension: 'png' }, source);
      };

      const createFileNode = async (fileNode, source) => {
        createNode({ ...fileNode, ...node.file }, source);
      };

      if (node.image) {
        try {
          imageNode = await createRemoteFileNode({
            url: node.image.download,
            store,
            cache,
            createNode: createImageNode,
            createNodeId: createContentDigest,
          });
        } catch (e) {
          console.error('Error creating image file nodes: ', e);
        }
      }

      if (node.file) {
        try {
          fileNode = await createRemoteFileNode({
            url: node.file.download,
            store,
            cache,
            createNode: createFileNode,
            createNodeId: createContentDigest,
          });
        } catch (e) {
          console.error('Error creating file nodes: ', e);
        }
      }

      if (imageNode && fileNode) {
        return {
          ...node,
          image___NODE: imageNode.id,
          file___NODE: fileNode.id,
        };
      } else if (imageNode) {
        return { ...node, image___NODE: imageNode.id };
      } else if (fileNode) {
        return { ...node, file___NODE: fileNode.id };
      } else {
        return node;
      }
    })
  );

  return updatedNodes;
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
  let itemsList = await fetchAllItems(
    `${baseUrl}/@search`,
    token,
    searchParams
  );

  // Filter out Plone site object so that it doesn't get repeated twice
  itemsList = itemsList.filter(item => item['@id'] !== baseUrl);

  logMessage('Fetching item data', showLogs);
  const items = await Promise.all(
    itemsList.map(async item => {
      const url = item['@id'];
      return await fetchData(url, token, expansions);
    })
  );

  // Mutable container for collecting all backlinks
  let backlinks = {};

  logMessage('Creating node structure', showLogs);
  const nodes = items.map(item => {
    return processData(item, baseUrl, backlinks, token);
  });

  // Fetch data, process node for PloneSite
  const ploneSite = await fetchData(baseUrl, token, expansions);
  const ploneSiteNode = processData(ploneSite, baseUrl, backlinks, token);
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
  let nodes = [],
    backlinks = {};
  const queue = [baseUrl];

  logMessage('Traversing the site and fetching data', showLogs);
  while (queue.length > 0) {
    const url = queue.shift();
    const itemData = await fetchData(url, token, expansions);

    const children = itemData.items
      ? itemData.items.map(item => item['@id'])
      : [];
    queue.push(...children);

    nodes.push(processData(itemData, baseUrl, backlinks, token));
  }

  return nodes;
};

// Main function
exports.sourceNodes = async (
  { actions, store, cache },
  {
    baseUrl,
    token,
    searchParams,
    expansions = ['breadcrumbs', 'navigation'],
    showLogs = false,
  }
) => {
  const { createNode } = actions;
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

  logMessage('Creating file nodes', showLogs);
  nodes = await processFileNodes(nodes, store, cache, createNode);

  logMessage('Creating nodes', showLogs);
  nodes.map(node => createNode(node));
};
