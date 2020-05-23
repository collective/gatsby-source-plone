import { fetchPlone } from './fetchPlone';
import { normalizeData } from './normalizeData';
import { makeNavigationNode } from './makeNavigationNode';

// Fetch only navigation component node
export const fetchPloneNavigationNode = async (
  id,
  token,
  baseUrl,
  ids,
  mock
) => {
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
    baseUrl,
    ids
  );
  // Yield navigation node
  return makeNavigationNode(
    `${id}/@navigation`,
    data,
    data._path.split('@navigation')[0]
  );
};
