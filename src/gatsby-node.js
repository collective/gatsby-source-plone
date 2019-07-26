import { createRemoteFileNode } from 'gatsby-source-filesystem';
import WebSocket from 'ws';

import {
  fetchPlone,
  logging,
  normalizeData,
  parentId,
  ploneNodeGenerator,
  fetchPloneNavigationNode,
  fetchPloneBreadcrumbsNode,
} from './utils';

const ComponentNodeTypes = new Set(['PloneBreadcrumbs', 'PloneNavigation']);

// GatsbyJS source plugin for Plone
exports.sourceNodes = async (
  { actions, cache, getNode, getNodes, store },
  { baseUrl, token, searchParams, expansions, logLevel, websocketUpdates }
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

  const updatePloneCollection = async function() {
    console.log('we are updating the Plone Collection');
    const nodes = getNodes().filter(
      n => n.internal.owner === `gatsby-source-plone`
    );
    const updateNodes = new Set();
    for (let item of nodes) {
      if (item._type === 'Collection') {
        updateNodes.add(item.id);
      }
    }
    for (let item of updateNodes) {
      for await (const node of ploneNodeGenerator(
        item,
        token,
        baseUrl,
        expansions,
        backlinks
      )) {
        logger.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
        createNode(node);
      }
    }
  };
  if (websocketUpdates) {
    let ws = new WebSocket(baseUrl.replace(/(http)(s)?\:\/\//, 'ws$2://'));
    let timerId = null;
    ws.onmessage = async msg => {
      let data = JSON.parse(msg.data);
      if (data['created']) {
        console.log('we are in created state');
        let urlChild = data['created'][0]['@id'];
        let urlParent = data['created'][0]['parent']['@id'];
        let urlList = [urlChild, urlParent];
        for (const url of urlList) {
          for await (const node of ploneNodeGenerator(
            url,
            token,
            baseUrl,
            expansions,
            backlinks
          )) {
            logger.info(
              `Creating node – ${node.id.replace(baseUrl, '') || '/'}`
            );
            createNode(node);
          }
        }
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(updatePloneCollection, 3000);
      }
      if (data['modified']) {
        console.log('we are in modified state');
        let urlChild = data['modified'][0]['@id'];
        let urlParent = data['modified'][0]['parent']['@id'];
        let urlList = [urlChild, urlParent];
        for (const url of urlList) {
          try {
            for await (const node of ploneNodeGenerator(
              url,
              token,
              baseUrl,
              expansions,
              backlinks
            )) {
              logger.info(
                `Creating node – ${node.id.replace(baseUrl, '') || '/'}`
              );
              createNode(node);
            }
          } catch (err) {
            logger.error(
              `Skipping node – ${url.replace(baseUrl, '')} (${err})`
            );
            let node = getNode(url);
            let breadcrumbsNode = getNode(`${url}/@breadcrumbs`);
            let navigationNode = getNode(`${url}/@navigation`);
            if (node) {
              console.log(`node deleted at ${url}`);
              deleteNode({ node: node });
            }
            if (breadcrumbsNode) {
              deleteNode({ node: breadcrumbsNode });
            }
            if (navigationNode) {
              deleteNode({ node: navigationNode });
            }
          }
        }
        try {
          const childItems = normalizeData(
            await fetchPlone(`${urlChild}/@search`, token, {
              ...searchParams,
            }),
            baseUrl
          );
          for (const item of childItems.items) {
            createNode(
              await fetchPloneNavigationNode(item._id, token, baseUrl)
            );
            createNode(
              await fetchPloneBreadcrumbsNode(item._id, token, baseUrl)
            );
          }
        } catch (err) {
          logger.error(
            `Skipping node – ${urlChild.replace(baseUrl, '')} (${err})`
          );
        }
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(updatePloneCollection, 3000);
      }
      if (data['removed']) {
        console.log('we are removed state');
        let url = data['removed'][0]['@id'];
        let urlParent = data['removed'][0]['parent']['@id'];
        let node = getNode(url);
        let breadcrumbsNode = getNode(`${url}/@breadcrumbs`);
        let navigationNode = getNode(`${url}/@navigation`);
        if (node) {
          console.log(`node deleted at ${url}`);
          deleteNode({ node: node });
        }
        if (breadcrumbsNode) {
          deleteNode({ node: breadcrumbsNode });
        }
        if (navigationNode) {
          deleteNode({ node: navigationNode });
        }
        try {
          for await (const node of ploneNodeGenerator(
            urlParent,
            token,
            baseUrl,
            expansions,
            backlinks
          )) {
            logger.info(
              `Creating node – ${node.id.replace(baseUrl, '') || '/'}`
            );
            createNode(node);
          }
        } catch (err) {
          logger.error(
            `Skipping node – ${urlParent.replace(baseUrl, '')} (${err})`
          );
        }
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(updatePloneCollection, 3000);
      }
    };
  }
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
          createNode: createImageNode,
          createNodeId: () => `${node.id} >> image`,
          httpHeaders: token ? { Authorization: `Bearer ${token}` } : {},
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
          createNodeId: () => `${node.id} >> file`,
          httpHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        });
        node.file___NODE = fileNode.id;
        createParentChildLink({ parent: node, child: fileNode });
      } catch (e) {
        logger.warn(`Error creating file node for ${node.id}: `, e);
      }
    }
  }
};
