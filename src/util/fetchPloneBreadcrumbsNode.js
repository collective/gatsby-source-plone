import { fetchPlone } from './fetchPlone';
import { makeBreadcrumbsNode } from './makeBreadcrumbsNode';
import { normalizeData } from './normalizeData';

// Fetch only breadcrumbs component node
export const fetchPloneBreadcrumbsNode = async (
  id,
  token,
  baseUrl,
  ids,
  mock
) => {
  // Fetch from Plone REST API and normalize it to be GraphQL compatible
  const data = normalizeData(
    await fetchPlone(`${id}/@breadcrumbs`, token, {}, mock),
    baseUrl,
    ids
  );
  // Yield breadcrumbs node
  return makeBreadcrumbsNode(
    `${id}/@breadcrumbs`,
    data,
    data._path.split('@breadcrumbs')[0]
  );
};
