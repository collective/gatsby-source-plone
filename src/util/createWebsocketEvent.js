import { ploneNodeGenerator } from './ploneNodeGenerator';

export const createWebsocketEvent = async function (
  data,
  token,
  baseUrl,
  expansions,
  backlinks,
  ids,
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
      backlinks,
      ids
    )) {
      reporter.info(`Creating node – ${node.id.replace(baseUrl, '') || '/'}`);
      createNode(node);
      if (!ids.has(node.id)) {
        ids.add(node.id);
      }
    }
  }
};
