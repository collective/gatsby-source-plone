import { createContentDigest } from './helper';
import { normalizePath } from './normalizePath';
import { normalizeType } from './normalizeType';
import { parseHTMLtoReact } from './parseHTMLtoReact';

// TODO: Make DownloadableContentTypes configurable
const DownloadableContentTypes = new Set(['Image', 'File']);

export const makeContentNode = (id, data, baseUrl, backlinks, ids) => {
  // mediaType is always set as 'text/html' as a common case, because
  // content objects may have html, images, files or combinations of them
  let node = {
    ...data,
    id: id,
    internal: {
      contentDigest: createContentDigest(data),
      mediaType: 'text/html',
    },
    // placeholder for nodes linked from Volto blocks
    blocks_nodes___NODE: [],
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
      } else if (backlinks.get(item._path).indexOf(node._path) === -1) {
        backlinks.get(item._path).push(node._path);
      }
    }
  }

  // Transform HTML string into serialized React tree
  if (node.text) {
    if (node.text['content-type'] === 'text/html') {
      const { react, references } = parseHTMLtoReact(node.text.data, baseUrl);
      node.text.react = react;
      node.text.nodes___NODE = [];
      for (const reference of references) {
        const link = normalizePath(reference.split(baseUrl)[1]);
        if (!backlinks.has(link)) {
          backlinks.set(link, [node._path]);
        } else if (backlinks.get(link).indexOf(node._path) === -1) {
          backlinks.get(link).push(node._path);
        }
        if (
          ids.has(reference) &&
          node.text.nodes___NODE.indexOf(reference) === -1
        ) {
          node.text.nodes___NODE.push(reference);
        }
      }
    }
  }

  // On 'Collection', remove 'query' field to hide GraphQL warnings
  if (node._type === 'Collection') {
    delete node.query;
  }

  // Collect backlinks for Volto blocks content
  for (const block of (node.blocks && node.blocks.length && node.blocks) ||
    []) {
    // Also match URLs for baseUrl without /api/ part, because of common Volto
    // backend deployment contention
    const baseUrls = new RegExp(/\/api\//).exec(baseUrl)
      ? [baseUrl, baseUrl.replace('/api/', '/')]
      : [baseUrl];
    for (const url of baseUrls) {
      const regexp = RegExp(`${url}[^"]*`, 'g');
      let match;
      while ((match = regexp.exec(block.config || '')) !== null) {
        let link = `/${match[0]
          .substring(url.length)
          .replace(/^\/*|\/.*$/, '')}/`;
        if (!backlinks.has(link)) {
          backlinks.set(link, [node._path]);
        } else if (backlinks.get(link).indexOf(node._path) === -1) {
          backlinks.get(link).push(node._path);
        }
        if (
          ids.has(match[0]) &&
          node.blocks_nodes___NODE.indexOf(match[0]) === -1
        ) {
          node.blocks_nodes___NODE.push(match[0]);
        }
      }
    }
  }

  // TODO: Recognize query fields from any content type

  return node;
};
