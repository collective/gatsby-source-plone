import { ploneNodeGenerator } from './ploneNodeGenerator';

export const updatePloneCollection = async function (
  getNodes,
  token,
  baseUrl,
  expansions,
  backlinks,
  createNode,
  reporter
) {
  reporter.info('we are updating the Plone Collection');
  const nodes = getNodes().filter(
    (n) => n.internal.owner === `gatsby-source-plone`
  );
  const updateNodes = new Set();
  for (let item of nodes) {
    if (item._type === 'Collection') {
      updateNodes.add(item.id);
    }
  }
  for (let item of updateNodes) {
    for await (const node of ploneNodeGenerator(
      item,
      token,
      baseUrl,
      expansions,
      backlinks
    )) {
      reporter.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
      createNode(node);
    }
  }
};
