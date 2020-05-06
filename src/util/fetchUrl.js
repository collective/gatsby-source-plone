import axiosRetry from 'axios-retry';
import axios from 'axios/index';
import { serializeParams } from './serializeParams';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000 + retryCount * 1000 * Math.random();
  },
});

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
