import { ploneNodeGenerator } from './ploneNodeGenerator';
import { fetchPlone } from './fetchPlone';
import { fetchPloneBreadcrumbsNode } from './fetchPloneBreadcrumbsNode';
import { fetchPloneNavigationNode } from './fetchPloneNavigationNode';
import { normalizeData } from './normalizeData';

export const modifiedWebSocketEvent = async function (
  data,
  createNode,
  getNode,
  deleteNode,
  token,
  baseUrl,
  expansions,
  backlinks,
  ids,
  searchParams,
  reporter
) {
  let urlChild = data['modified'][0]['@id'];
  let urlParent = data['modified'][0]['parent']['@id'];
  let urlList = [urlChild, urlParent];
  for (const url of urlList) {
    try {
      for await (const node of ploneNodeGenerator(
        url,
        token,
        baseUrl,
        expansions,
        backlinks,
        ids
      )) {
        reporter.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
        createNode(node);
      }
    } catch (err) {
      reporter.error(`Skipping node – ${url.replace(baseUrl, '')} (${err})`);
      let node = getNode(url);
      let breadcrumbsNode = getNode(`${url}/@breadcrumbs`);
      let navigationNode = getNode(`${url}/@navigation`);
      if (ids.has(node.id)) {
        ids.delete(node.id);
      }
      if (node) {
        reporter.info(`node deleted at ${url}`);
        deleteNode({ node: node });
      }
      if (breadcrumbsNode) {
        deleteNode({ node: breadcrumbsNode });
      }
      if (navigationNode) {
        deleteNode({ node: navigationNode });
      }
    }
  }
  await childItemsForUrl(
    urlChild,
    token,
    baseUrl,
    ids,
    createNode,
    searchParams,
    reporter
  );
};

const childItemsForUrl = async function (
  urlChild,
  token,
  baseUrl,
  ids,
  createNode,
  searchParams,
  reporter
) {
  try {
    const childItems = normalizeData(
      await fetchPlone(`${urlChild}/@search`, token, {
        ...searchParams,
      }),
      baseUrl,
      ids
    );
    for (const item of childItems.items) {
      createNode(await fetchPloneNavigationNode(item._id, token, baseUrl, ids));
      createNode(
        await fetchPloneBreadcrumbsNode(item._id, token, baseUrl, ids)
      );
    }
  } catch (err) {
    reporter.error(`Skipping node – ${urlChild.replace(baseUrl, '')} (${err})`);
  }
};
