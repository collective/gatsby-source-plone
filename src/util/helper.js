import crypto from 'crypto';

// Create content digest (hash)
export const createContentDigest = (data) =>
  crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');

// Get URL without query parameters
export const urlWithoutParameters = (url) => {
  return url.split('?')[0];
};

// Return parent id for Plone REST API content object id
export const parentId = (id) =>
  id.match(/\//g).length >= 3 ? id.split('/').slice(0, -1).join('/') : id;
