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
