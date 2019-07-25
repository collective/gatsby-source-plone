import axios from 'axios/index';
import crypto from 'crypto';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { serialize } from 'react-serialize';

// TODO: Make DownloadableContentTypes configurable
const DownloadableContentTypes = new Set(['Image', 'File']);

// Minimal logging module mimicking Python logging module
export const logging = {
  CRITICAL: 50,
  ERROR: 40,
  WARNING: 30,
  INFO: 20,
  DEBUG: 10,
  getLogger: (logLevel, out = console) => {
    return {
      critical: msg =>
        logging.CRITICAL >= logLevel ? out.error(`Plone – ${msg}`) : null,
      error: msg =>
        logging.ERROR >= logLevel ? out.error(`Plone – ${msg}`) : null,
      warn: msg =>
        logging.WARNING >= logLevel ? out.warn(`Plone – ${msg}`) : null,
      info: msg =>
        logging.INFO >= logLevel ? out.info(`Plone – ${msg}`) : null,
      debug: msg =>
        logging.DEBUG >= logLevel ? out.debug(`Plone – ${msg}`) : null,
    };
  },
};

// Create content digest (hash)
export const createContentDigest = data =>
  crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');

// Get URL without query parameters
export const urlWithoutParameters = url => {
  return url.split('?')[0];
};

// Return parent id for Plone REST API content object id
export const parentId = id =>
  id.match(/\//g).length >= 3
    ? id
        .split('/')
        .slice(0, -1)
        .join('/')
    : id;

// Normalize path
export const normalizePath = path => {
  path = path ? path.replace(/^\/*/, '/').replace(/\/*$/, '/') : '/';
  if (path.match(/\/view\/$/)) {
    path = path.substr(0, path.length - 'view/'.length);
  }
  return path;
};

// Camelize
export const normalizeType = type => {
  type = type
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter) {
      return letter.toUpperCase();
    })
    .replace(/[\s\.]+/g, '');
  return type.startsWith('Plone') ? type : `Plone${type}`;
};

// Add token to header when given
export const headersWithToken = (headers, token) =>
  token ? { ...headers, Authorization: `Bearer ${token}` } : headers;

// Fetch JSON data from an URL
export const fetchUrl = async (url, token, params, http = axios) => {
  const response = await http.get(url, {
    headers: headersWithToken(
      {
        Accept: 'application/json',
      },
      token
    ),
    params: params,
    paramsSerializer: serializeParams,
  });
  return response.data || {};
};

// Fetch Plone JSON REST API data with batching expanded
export const fetchPlone = async (url, token, params, http = axios) => {
  let batch, data;
  batch = data = await fetchUrl(url, token, params, http);
  while (1) {
    if (batch['batching']) {
      if (batch['batching'].next) {
        batch = await fetchUrl(batch['batching'].next, token, {}, http);
        data.items.push(...batch.items);
      } else break;
    } else {
      break;
    }
  }
  return data;
};

// Normalize Plone JSON to be usable as such in GatsbyJS
export const normalizeData = function(data, baseUrl) {
  // - Adds '@id' for plone.restapi < 1.0b1 results from 'url'
  if (!data['@id'] && data.url) {
    data['@id'] = data.url;
  }
  // - Adds '_path' without baseUrl for objects with '@id'
  if (data['@id']) {
    // _path variables are used similarly to slugs in
    // https://www.gatsbyjs.org/tutorial/part-seven/
    data['_path'] = normalizePath(
      urlWithoutParameters(data['@id']).split(baseUrl)[1]
    );
  }
  // - Handle '@components' and 'items' recursively
  // - Prefixes reserved keys with '_'
  //   to allow them to be queried with GraphQL
  // - Replaces '@' to '_' in properties starting with '@'
  for (const [key, value] of Object.entries(data)) {
    if (new Set(['id', 'parent', 'children']).has(key)) {
      if (key === 'parent') {
        data[`_${key}`] = normalizeData(value, baseUrl);
      } else {
        data[`_${key}`] = value;
      }
      delete data[key];
    } else if (key === 'items') {
      data[key] = (value || []).map(item => normalizeData(item, baseUrl));
      data.nodes___NODE = data[key]
        .filter(item => !item['_id'].match('@'))
        .map(item => item['_id']);
    } else if (key === 'relatedItems') {
      data[key] = (value || []).map(item => normalizeData(item, baseUrl));
      data.relatedNodes___NODE = data[key]
        .filter(item => !item['_id'].match('@'))
        .map(item => item['_id']);
    } else if (key === '@id') {
      if (value.match(/\/view$/)) {
        // @navigation may contain @id values with reserved /view suffix
        // that is convenient on Plone, but makes no sense with GatsbyJS
        data['_id'] = value.substr(0, value.length - '/view'.length);
      } else {
        data['_id'] = value;
      }
      delete data[key];
    } else if (key === '@components') {
      data._components = {};
      for (const [key_, value_] of Object.entries(value)) {
        if (value_ !== null) {
          data._components[key_] = normalizeData(value_, baseUrl);
          data._components[key_]._path = data._path;
        }
      }
      delete data[key];
    } else if (key.length && key[0] === '@') {
      data['_' + key.slice(1)] = value;
      delete data[key];
    }
  }
  return data;
};

// Process HTML data using react-html-parser
export const parseHTMLtoReact = (html, baseUrl, path, backlinks) => {
  const transform = (node, index) => {
    // Replace hyperlinks with relative links
    if (node.type === 'tag' && node.name === 'a') {
      if (node.attribs.href && node.attribs.href.startsWith(baseUrl)) {
        node.attribs.to = normalizePath(node.attribs.href.split(baseUrl)[1]);
        node.attribs.href = null;
        node.name = 'Link';
        if (!backlinks.has(node.attribs.to)) {
          backlinks.set(node.attribs.to, [path]);
        } else {
          backlinks.get(node.attribs.to).push(path);
        }
        return convertNodeToElement(node, index, transform);
      }
    }

    // Replace image src with relative paths
    if (node.type === 'tag' && node.name === 'img') {
      if (node.attribs.src && node.attribs.src.startsWith(baseUrl)) {
        node.attribs['data-download'] = node.attribs.src;
        node.attribs.src = normalizePath(
          node.attribs.src.split(baseUrl)[1].split('/@@images')[0]
        );
        node.name = 'Img';
        if (!backlinks.has(node.attribs.src)) {
          backlinks.set(node.attribs.src, [path]);
        } else {
          backlinks.get(node.attribs.src).push(path);
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

export const serializeParams = params => {
  let parts = [];

  Object.entries(params).forEach(([key, val]) => {
    if (val === null || typeof val === 'undefined') {
      return;
    }

    if (Array.isArray(val)) {
      key = key + ':list';
    } else if (typeof val === 'number') {
      key = key + ':int';
      val = [val];
    } else {
      val = [val];
    }

    val.forEach(v => {
      if (typeof v.getMonth === 'function') {
        v = v.toISOString();
      } else if (typeof v === 'object') {
        // TODO: serialize into ZPublisher :record -format
        v = JSON.stringify(v);
      }
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
    });
  });

  return parts.join('&');
};

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

export const makeNavigationNode = (id, data, path) => {
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

export const makeBreadcrumbsNode = (id, data, path) => {
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

// Fetch only navigation component node
export const fetchPloneNavigationNode = async (id, token, baseUrl, mock) => {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(
      `${id}/@navigation`,
      token,
      {
        // TODO: Higher depth results in "conflicting field types in your data"
        'expand.navigation.depth': 1,
      },
      mock
    ),
    baseUrl
  );
  // Yield navigation node
  return makeNavigationNode(
    `${id}/@navigation`,
    data,
    data._path.split('@navigation')[0]
  );
};

// Fetch only breadcrumbs component node
export const fetchPloneBreadcrumbsNode = async (id, token, baseUrl, mock) => {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(`${id}/@breadcrumbs`, token, {}, mock),
    baseUrl
  );
  // Yield breadcrumbs node
  return makeBreadcrumbsNode(
    `${id}/@breadcrumbs`,
    data,
    data._path.split('@breadcrumbs')[0]
  );
};

// Generator to yield the supported nodes for a single Plone content object
export const ploneNodeGenerator = async function*(
  id,
  token,
  baseUrl,
  expansions,
  backlinks,
  mock
) {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(
      id,
      token,
      {
        expand: Array.from(
          new Set((expansions || []).concat(['breadcrumbs', 'navigation']))
        ).join(),
        // TODO: Higher depth results in "conflicting field types in your data"
        'expand.navigation.depth': 1,
      },
      mock
    ),
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
