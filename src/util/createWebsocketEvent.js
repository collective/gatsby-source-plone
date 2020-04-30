import { ploneNodeGenerator } from './ploneNodeGenerator';

export const createWebsocketEvent = async function (
  data,
  token,
  baseUrl,
  expansions,
  backlinks,
  createNode,
  reporter
) {
  let urlChild = data['created'][0]['@id'];
  let urlParent = data['created'][0]['parent']['@id'];
  let urlList = [urlChild, urlParent];
  for (const url of urlList) {
    for await (const node of ploneNodeGenerator(
      url,
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
