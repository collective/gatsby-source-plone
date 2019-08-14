import { createRemoteFileNode } from 'gatsby-source-filesystem';
import WebSocket from 'ws';
import { parentId } from './util/helper';
import { fetchPlone } from './util/fetchPlone';
import { normalizeData } from './util/normalizeData';
import { ploneNodeGenerator } from './util/ploneNodeGenerator';
import { fetchPloneBreadcrumbsNode } from './util/fetchPloneBreadcrumbsNode';
import { fetchPloneNavigationNode } from './util/fetchPloneNavigationNode';
import { updatePloneCollection } from './util/updatePloneCollection';
import { modifiedWebSocketEvent } from './util/modifiedWebSocketEvent';
import { createWebsocketEvent } from './util/createWebsocketEvent';
import { deleteWebSocketEvent } from './util/deleteWebSocketEvent';

const ComponentNodeTypes = new Set(['PloneBreadcrumbs', 'PloneNavigation']);

// GatsbyJS source plugin for Plone
exports.sourceNodes = async (
  { actions, cache, getNode, getNodes, store, reporter },
  { baseUrl, token, searchParams, expansions, logLevel, websocketUpdates }
) => {
  const { createNode, deleteNode, setPluginStatus, touchNode } = actions;
  let state = {},
    newState = {
      lastFetched: new Date(),
    };

  reporter.info('Reading plugin status');
  if (
    store.getState().status.plugins &&
    store.getState().status.plugins['gatsby-source-plone']
  ) {
    state = store.getState().status.plugins['gatsby-source-plone'];
  }
  reporter.info(JSON.stringify(state));

  // Normalize baseUrl into form without ending slash
  baseUrl = baseUrl.replace(/\/+$/, '');

  reporter.info('Fetching all metadata');
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
    reporter.info('Creating all nodes');
    for (const item of plone.items) {
      try {
        for await (const node of ploneNodeGenerator(
          item._id,
          token,
          baseUrl,
          expansions,
          backlinks
        )) {
          reporter.info(
            `Creating node – ${node.id.replace(baseUrl, '') || '/'}`
          );
          createNode(node);
        }
      } catch (e) {
        reporter.error(
          `Skipping node – ${item._id.replace(baseUrl, '')} (${e})`
        );
      }
    }
  } else {
    // Iterating all nodes seem to be common way to list cached nodes
    const nodesById = getNodes()
      .filter(n => n.internal.owner === `gatsby-source-plone`)
      .reduce((map, node) => map.set(node.id, node), new Map());

    const updateNodes = new Set();
    const updateParents = new Set();

    reporter.info('Resolving new and changed nodes');
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

    reporter.info('Deleting removed nodes');
    for (const node of nodesById.values()) {
      if (!ComponentNodeTypes.has(node.internal.type)) {
        updateParents.add(parentId(node.id));
      }
      reporter.info(`Deleting node – ${node.id.replace(baseUrl, '') || '/'}`);
      deleteNode({ node: node });
      for (const id of node.children || []) {
        const child = getNode(id);
        if (child) {
          reporter.info(`Deleting node – ${id.replace(baseUrl, '') || '/'}`);
          deleteNode({ node: child });
        }
      }
    }

    reporter.info('Updating changed nodes');
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
          reporter.info(
            `Creating node – ${node.id.replace(baseUrl, '') || '/'}`
          );
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
          reporter.info(
            `Creating node – ${node.id.replace(baseUrl, '') || '/'}`
          );
          createNode(node);
        }
        // For changed parents, navigation of all children must be updated
        dirtyNavigation =
          dirtyNavigation === null || !item._id.startsWith(dirtyNavigation)
            ? item._id
            : dirtyNavigation;
      } else {
        reporter.info(
          `Touching node – ${item._id.replace(baseUrl, '') || '/'}`
        );
        touchNode({ nodeId: item._id });
        for (const id of getNode(item._id).children || []) {
          reporter.info(`Touching node – ${id.replace(baseUrl, '') || '/'}`);
          touchNode({ nodeId: id });
        }
        if (!item._id.startsWith(dirtyBreadcrumbs)) {
          reporter.info(
            `Touching node – ${item._id.replace(baseUrl, '') ||
              '/'}/@breadcrumbs`
          );
          touchNode({ nodeId: `${item._id}/@breadcrumbs` });
        } else {
          reporter.info(
            `Creating node – ${item._id.replace(baseUrl, '') ||
              '/'}/@breadcrumbs`
          );
          createNode(await fetchPloneBreadcrumbsNode(item._id, token, baseUrl));
        }
        if (!item._id.startsWith(dirtyNavigation)) {
          reporter.info(
            `Touching node – ${item._id.replace(baseUrl, '') ||
              '/'}/@navigation`
          );
          touchNode({ nodeId: `${item._id}/@navigation` });
        } else {
          reporter.info(
            `Creating node – ${item._id.replace(baseUrl, '') ||
              '/'}/@navigation`
          );
          createNode(await fetchPloneNavigationNode(item._id, token, baseUrl));
        }
      }
    }
  }
  reporter.info('Setting plugin status');
  reporter.info(JSON.stringify(newState));

  const webSocketStart = function() {
    let ws = new WebSocket('ws://localhost:8080/Plone/');
    let timerId = null;
    ws.onopen = function() {
      console.log('connected!');
    };
    ws.onmessage = async msg => {
      let data = JSON.parse(msg.data);
      if (data['created']) {
        reporter.info('we are in created state');
        await createWebsocketEvent(
          data,
          token,
          baseUrl,
          expansions,
          backlinks,
          createNode,
          reporter
        );
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(
          updatePloneCollection,
          3000,
          getNodes,
          token,
          baseUrl,
          expansions,
          backlinks,
          createNode,
          reporter
        );
      }
      if (data['modified']) {
        reporter.info('we are in modified state');
        await modifiedWebSocketEvent(
          data,
          createNode,
          getNode,
          deleteNode,
          token,
          baseUrl,
          expansions,
          backlinks,
          searchParams,
          reporter
        );
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(
          updatePloneCollection,
          3000,
          getNodes,
          token,
          baseUrl,
          expansions,
          backlinks,
          createNode,
          reporter
        );
      }
      if (data['removed']) {
        reporter.info('we are in removed state');
        await deleteWebSocketEvent(
          data,
          getNode,
          deleteNode,
          createNode,
          token,
          baseUrl,
          expansions,
          backlinks,
          reporter
        );
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(
          updatePloneCollection,
          3000,
          getNodes,
          token,
          baseUrl,
          expansions,
          backlinks,
          createNode,
          reporter
        );
      }
    };
    ws.onclose = function() {
      const previousDelay = 1;
      reporter.info('websocket is closed due to server reboot');
      reconnectingWebSocket(ws, previousDelay);
    };
    ws.onerror = function(err) {
      console.log('we got an error');
      console.log(err.stack);
    };
  };

  const reconnectingWebSocket = function(ws, previousDelay) {
    previousDelay = Math.min(60, previousDelay * (2 - Math.random()));
    const intervalId = setInterval(
      () => {
        if (!ws || ws.readyState == 3) {
          console.log('we are retrying to connect');
          webSocketStart();
        } else {
          console.log('we are clearing the intervalId');
          clearInterval(intervalId);
        }
      },
      previousDelay,
      ws
    );
  };

  if (websocketUpdates) {
    webSocketStart();
  }
  setPluginStatus(newState);
  reporter.info('Done');
};

// GatsbyJS transform plugin for Plone content nodes with binary attributes
// Expand file and image attributes into linked remote file nodes
exports.onCreateNode = async (
  { node, actions, cache, store, reporter },
  { baseUrl, token, imageScale, logLevel }
) => {
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
      reporter.info(`Fetching image – ${node.id.replace(baseUrl, '') || '/'}`);
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
        reporter.warn(`Error creating image node for ${node.id}: `, e);
      }
    }

    if (node.file) {
      reporter.info(`Fetching file – ${node.id.replace(baseUrl, '') || '/'}`);
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
        reporter.warn(`Error creating file node for ${node.id}: `, e);
      }
    }
  }
};
