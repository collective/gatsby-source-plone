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