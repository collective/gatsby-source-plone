import { createRemoteFileNode } from 'gatsby-source-filesystem';

import {
  createContentDigest,
  fetchPlone,
  logging,
  normalizeData,
  normalizeType,
  parentId,
  parseHTMLtoReact,
} from './utils';

const ComponentNodeTypes = new Set(['PloneBreadcrumbs', 'PloneNavigation']);
const DownloadableContentTypes = new Set(['Image', 'File']);

// TODO: Make DownloadableContentTypes configurable

// Make gatsby node from Plone REST API data
const makeContentNode = (id, data, baseUrl, backlinks) => {
  // mediaType is always set as 'text/html' as a common case, because
  // content objects may have html, images, files or combinations of them
  let node = {
    ...data,
    id: id,
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'text/html',
    },
  };

  if (id === baseUrl) {
    // Node at baseUrl is always created as PloneSite node
    node.internal.type = 'PloneSite';
  } else {
    // Node types are 'Plone'-prefixed content types without white spaces
    node.internal.type = normalizeType(node._type);
  }

  // Add array of backlinks to support GraphQL queries for related nodes
  if (!backlinks.has(node._path)) {
    // Create a new container, with a value to ensure it is never dropped
    backlinks.set(node._path, ['']);
    node._backlinks = backlinks.get(node._path);
  } else {
    // Merge with the already found backlinks
    node._backlinks = backlinks.get(node._path);
  }

  // Link image and file items to their containers to support download links
  for (const item of node.items || []) {
    if (DownloadableContentTypes.has(item._type)) {
      if (!backlinks.has(item._path)) {
        backlinks.set(item._path, [node._path]);
      } else {
        backlinks.get(item._path).push(node._path);
      }
    }
  }

  // Transform HTML string into serialized React tree
  if (node.text) {
    if (node.text['content-type'] === 'text/html') {
      node.text.react = parseHTMLtoReact(
        node.text.data,
        baseUrl,
        node._path,
        backlinks
      );
    }
  }

  // On 'Collection', remove 'query' field to hide GraphQL warnings
  if (node._type === 'Collection') {
    delete node.query;
  }

  // TODO: Recognize query fields from any content type

  return node;
};

const makeNavigationNode = (id, data, path) => {
  return {
    ...data,
    id: id,
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'application/json',
      type: 'PloneNavigation',
    },
    _path: path,
  };
};

const makeBreadcrumbsNode = (id, data, path) => {
  return {
    ...data,
    id: id,
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'application/json',
      type: 'PloneBreadcrumbs',
    },
    _path: path,
  };
};

// Generator to yield the supported nodes for a single Plone content object
const ploneNodeGenerator = async function*(
  id,
  token,
  baseUrl,
  expansions,
  backlinks
) {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(id, token, {
      expand: Array.from(
        new Set((expansions || []).concat(['breadcrumbs', 'navigation']))
      ).join(),
      // TODO: Higher depth results in "conflicting field types in your data"
      'expand.navigation.depth': 1,
    }),
    baseUrl
  );

  // Yield content node
  yield makeContentNode(id, data, baseUrl, backlinks);

  // Yield breadcrumbs node
  if (data._components && data._components.breadcrumbs) {
    yield makeBreadcrumbsNode(
      `${id}/@breadcrumbs`,
      data._components.breadcrumbs,
      data._path
    );
  }

  // Yield navigation node
  if (data._components && data._components.navigation) {
    yield makeNavigationNode(
      `${id}/@navigation`,
      data._components.navigation,
      data._path
    );
  }
};

// Fetch only breadcrumbs component node
const fetchPloneBreadcrumbsNode = async (id, token, baseUrl) => {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(`${id}/@breadcrumbs`, token),
    baseUrl
  );
  // Yield breadcrumbs node
  return makeBreadcrumbsNode(
    `${id}/@breadcrumbs`,
    data,
    data._path.split('@breadcrumbs')[0]
  );
};

// Fetch only navigation component node
const fetchPloneNavigationNode = async (id, token, baseUrl) => {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(`${id}/@navigation`, token, {
      // TODO: Higher depth results in "conflicting field types in your data"
      'expand.navigation.depth': 1,
    }),
    baseUrl
  );
  // Yield navigation node
  return makeNavigationNode(
    `${id}/@navigation`,
    data,
    data._path.split('@navigation')[0]
  );
};

// GatsbyJS source plugin for Plone
exports.sourceNodes = async (
  { actions, cache, getNode, getNodes, store },
  { baseUrl, token, searchParams, expansions, logLevel }
) => {
  const { createNode, deleteNode, setPluginStatus, touchNode } = actions;
  let state = {},
    newState = {
      lastFetched: new Date(),
    };
  const logger = logging.getLogger(logging[logLevel] || 100);

  logger.info('Reading plugin status');
  if (
    store.getState().status.plugins &&
    store.getState().status.plugins['gatsby-source-plone']
  ) {
    state = store.getState().status.plugins['gatsby-source-plone'];
  }
  logger.debug(JSON.stringify(state));

  // Normalize baseUrl into form without ending slash
  baseUrl = baseUrl.replace(/\/+$/, '');

  logger.info('Fetching all metadata');
  const plone = normalizeData(
    await fetchPlone(
      `${baseUrl}/@search`,
      token,
      // Search nodes in path order to ensure parents before their children
      {
        ...searchParams,
        metadata_fields: 'modified',
        sort_on: 'path',
        sort_order: 'ascending',
      }
    ),
    baseUrl
  );
  // Ensure that items include baseUrl
  if (!plone.items.length || plone.items[0]._id !== baseUrl) {
    plone.items.unshift({ _id: baseUrl });
  }

  // Define shared backlinks container to collect links between nodes
  const backlinks = new Map();

  if (!state.lastFetched) {
    logger.info('Creating all nodes');
    for (const item of plone.items) {
      try {
        for await (const node of ploneNodeGenerator(
          item._id,
          token,
          baseUrl,
          expansions,
          backlinks
        )) {
          logger.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
          createNode(node);
        }
      } catch (e) {
        logger.error(`Skipping node – ${item._id.replace(baseUrl, '')} (${e})`);
      }
    }
  } else {
    // Iterating all nodes seem to be common way to list cached nodes
    const nodesById = getNodes()
      .filter(n => n.internal.owner === `gatsby-source-plone`)
      .reduce((map, node) => map.set(node.id, node), new Map());

    const updateNodes = new Set();
    const updateParents = new Set();

    logger.info('Resolving new and changed nodes');
    for (const item of plone.items) {
      if (!nodesById.has(item._id)) {
        // Fetch new node
        updateNodes.add(item._id);
        updateParents.add(parentId(item._id));
      } else if (state.lastFetched < item.modified) {
        // Update changed node
        updateNodes.add(item._id);
        updateParents.add(parentId(item._id));
      } else if (item._id === baseUrl) {
        // Update "PloneSite" (at baseUrl)
        updateNodes.add(item._id);
      } else if (item._type === 'Collection') {
        // Update Collections
        updateNodes.add(item._id);
      }
      // Remove seen nodes from the map
      nodesById.delete(item._id);
      nodesById.delete(`${item._id}/@breadcrumbs`);
      nodesById.delete(`${item._id}/@navigation`);
    }

    logger.info('Deleting removed nodes');
    for (const node of nodesById.values()) {
      if (!ComponentNodeTypes.has(node.internal.type)) {
        updateParents.add(parentId(node.id));
      }
      logger.info(`Deleting node – ${node.id.replace(baseUrl, '') || '/'}`);
      deleteNode({ node: node });
      for (const id of node.children || []) {
        const child = getNode(id);
        if (child) {
          logger.info(`Deleting node – ${id.replace(baseUrl, '') || '/'}`);
          deleteNode({ node: child });
        }
      }
    }

    logger.info('Updating changed nodes');
    let dirtyBreadcrumbs = null;
    let dirtyNavigation = null;
    for (const item of plone.items) {
      if (updateNodes.has(item._id)) {
        for await (const node of ploneNodeGenerator(
          item._id,
          token,
          baseUrl,
          expansions,
          backlinks
        )) {
          logger.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
          createNode(node);
        }
        // For updated nodes, breadcrumbs of all children must be updated
        if (item._id !== baseUrl) {
          // except for update baseUrl
          dirtyBreadcrumbs =
            dirtyBreadcrumbs === null || !item._id.startsWith(dirtyBreadcrumbs)
              ? item._id
              : dirtyBreadcrumbs;
        }
      } else if (updateParents.has(item._id)) {
        for await (const node of ploneNodeGenerator(
          item._id,
          token,
          baseUrl,
          expansions,
          backlinks
        )) {
          logger.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
          createNode(node);
        }
        // For changed parents, navigation of all children must be updated
        dirtyNavigation =
          dirtyNavigation === null || !item._id.startsWith(dirtyNavigation)
            ? item._id
            : dirtyNavigation;
      } else {
        logger.debug(`Touching node – ${item._id.replace(baseUrl, '') || '/'}`);
        touchNode({ nodeId: item._id });
        for (const id of getNode(item._id).children || []) {
          logger.debug(`Touching node – ${id.replace(baseUrl, '') || '/'}`);
          touchNode({ nodeId: id });
        }
        if (!item._id.startsWith(dirtyBreadcrumbs)) {
          logger.debug(
            `Touching node – ${item._id.replace(baseUrl, '') ||
              '/'}/@breadcrumbs`
          );
          touchNode({ nodeId: `${item._id}/@breadcrumbs` });
        } else {
          logger.debug(
            `Creating node – ${item._id.replace(baseUrl, '') ||
              '/'}/@breadcrumbs`
          );
          createNode(await fetchPloneBreadcrumbsNode(item._id, token, baseUrl));
        }
        if (!item._id.startsWith(dirtyNavigation)) {
          logger.debug(
            `Touching node – ${item._id.replace(baseUrl, '') ||
              '/'}/@navigation`
          );
          touchNode({ nodeId: `${item._id}/@navigation` });
        } else {
          logger.info(
            `Creating node – ${item._id.replace(baseUrl, '') ||
              '/'}/@navigation`
          );
          createNode(await fetchPloneNavigationNode(item._id, token, baseUrl));
        }
      }
    }
  }
  logger.info('Setting plugin status');
  logger.debug(JSON.stringify(newState));
  setPluginStatus(newState);
  logger.info('Done');
};

// GatsbyJS transform plugin for Plone content nodes with binary attributes
// Expand file and image attributes into linked remote file nodes
exports.onCreateNode = async (
  { node, actions, cache, store },
  { baseUrl, token, imageScale, logLevel }
) => {
  const logger = logging.getLogger(logging[logLevel] || 100);
  if (
    node.internal.type.match(/Plone/) &&
    !ComponentNodeTypes.has(node.internal.type)
  ) {
    const { createNode, createParentChildLink } = actions;

    // TODO: Add argument for attribute names to check for expandable files

    // TODO: Add support for authentication; gatsby-source-filesystem supports
    //       currently only basic auth for createRemoteFileNode

    // Wrapper function for createNode
    // Adds 'png' extension to node so that gatsby-tranform-sharp recognizes it
    // Also, appends existing node.image data along with fileNode data
    const createImageNode = async (fileNode, source) => {
      let extension = (node.image.filename || '').split('.').splice(-1)[0];
      createNode(
        {
          ...fileNode,
          ...node.image,
          parent: node.id,
          extension: (extension || 'png').toLowerCase(),
        },
        source
      );
    };

    const createFileNode = async (fileNode, source) => {
      createNode(
        {
          ...fileNode,
          ...node.file,
          parent: node.id,
        },
        source
      );
    };

    if (node.image) {
      logger.info(`Fetching image – ${node.id.replace(baseUrl, '') || '/'}`);
      try {
        const imageNode = await createRemoteFileNode({
          url: imageScale
            ? `${node.image.download}/${imageScale}`
            : node.image.download,
          store,
          cache,
          headers: { Authorization: `Bearer ${token}` },
          createNode: createImageNode,
          createNodeId: () => `${node.id} >> image`,
        });
        node.image___NODE = imageNode.id;
        createParentChildLink({ parent: node, child: imageNode });
      } catch (e) {
        logger.warn(`Error creating image node for ${node.id}: `, e);
      }
    }

    if (node.file) {
      logger.info(`Fetching file – ${node.id.replace(baseUrl, '') || '/'}`);
      try {
        const fileNode = await createRemoteFileNode({
          url: node.file.download,
          store,
          cache,
          createNode: createFileNode,
          headers: { Authorization: `Bearer ${token}` },
          createNodeId: () => `${node.id} >> file`,
        });
        node.file___NODE = fileNode.id;
        createParentChildLink({ parent: node, child: fileNode });
      } catch (e) {
        logger.warn(`Error creating file node for ${node.id}: `, e);
      }
    }
  }
};
