import crypto from 'crypto';

// Helper to create content digest
export const createContentDigest = item =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(item))
    .digest(`hex`);

// Helper to add token to header if present
export const headersWithToken = (headers, token) =>
  token ? { ...headers, Authorization: `Bearer ${token}` } : headers;

// Display logs when showLogs is true
export const logMessage = (message, showLogs) => {
  if (showLogs) {
    console.log(message);
  }
};

// Helper to get URL without expansion parameters
export const urlWithoutParameters = url => {
  return url.split('?')[0];
};

// Helper to normalize paths
export const normalizePath = path => {
  return path.replace(/^\/*/, '/').replace(/\/*$/, '/');
};
