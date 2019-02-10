import axios from 'axios/index';
import crypto from 'crypto';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { serialize } from 'react-serialize';

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
  return path ? path.replace(/^\/*/, '/').replace(/\/*$/, '/') : '/';
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
    if (key === '@components') {
      data._components = {};
      for (const [key_, value_] of Object.entries(value)) {
        if (value_ !== null) {
          data._components[key_] = normalizeData(value_, baseUrl);
          data._components[key_]._path = data._path;
        }
      }
      delete data[key];
    } else if (key === 'items' && value) {
      data[key] = value.map(item => normalizeData(item, baseUrl));
    } else if (new Set(['id', 'parent', 'children']).has(key)) {
      if (key === 'parent') {
        data[`_${key}`] = normalizeData(value, baseUrl);
      } else {
        data[`_${key}`] = value;
      }
      delete data[key];
    } else if (key.length && key[0] === '@') {
      if (key === 'id') {
        data.id = value;
      } else {
        data['_' + key.slice(1)] = value;
      }
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
