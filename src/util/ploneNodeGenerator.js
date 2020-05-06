import { normalizeData } from './normalizeData';
import { makeBreadcrumbsNode } from './makeBreadcrumbsNode';
import { makeContentNode } from './makeContentNode';
import { makeNavigationNode } from './makeNavigationNode';
import { fetchPlone } from './fetchPlone';

export const ploneNodeGenerator = async function* (
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
