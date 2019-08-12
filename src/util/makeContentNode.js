import { createContentDigest } from './helper';
import { normalizeType } from './normalizeType';
import { parseHTMLtoReact } from './parseHTMLtoReact';

// TODO: Make DownloadableContentTypes configurable
const DownloadableContentTypes = new Set(['Image', 'File']);

export const makeContentNode = (id, data, baseUrl, backlinks) => {
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
