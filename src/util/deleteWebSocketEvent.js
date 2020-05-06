import { ploneNodeGenerator } from './ploneNodeGenerator';

export const deleteWebSocketEvent = async function (
  data,
  getNode,
  deleteNode,
  createNode,
  token,
  baseUrl,
  expansions,
  backlinks,
  reporter
) {
  let url = data['removed'][0]['@id'];
  let urlParent = data['removed'][0]['parent']['@id'];
  let node = getNode(url);
  let breadcrumbsNode = getNode(`${url}/@breadcrumbs`);
  let navigationNode = getNode(`${url}/@navigation`);
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
  try {
    for await (const node of ploneNodeGenerator(
      urlParent,
      token,
      baseUrl,
      expansions,
      backlinks
    )) {
      reporter.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
      createNode(node);
    }
  } catch (err) {
    reporter.info(`Skipping node – ${urlParent.replace(baseUrl, '')} (${err})`);
  }
};
