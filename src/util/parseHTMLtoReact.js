import { normalizePath } from './normalizePath';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { serialize } from 'react-serialize';

export const parseHTMLtoReact = (html, baseUrl) => {
  const references = [];

  const transform = (node, index) => {
    // Replace hyperlinks with relative links
    if (node.type === 'tag' && node.name === 'a') {
      if (node.attribs.href && node.attribs.href.startsWith(baseUrl)) {
        references.push(node.attribs.href);
        node.attribs.to = normalizePath(node.attribs.href.split(baseUrl)[1]);
        node.attribs.href = null;
        node.name = 'Link';
        return convertNodeToElement(node, index, transform);
      }
    }

    // Replace image src with relative paths
    if (node.type === 'tag' && node.name === 'img') {
      if (node.attribs.src && node.attribs.src.startsWith(baseUrl)) {
        references.push(node.attribs.src.split('/@@images')[0]);
        node.attribs['data-download'] = node.attribs.src;
        node.attribs.src = normalizePath(
          node.attribs.src.split(baseUrl)[1].split('/@@images')[0]
        );
        node.name = 'Img';
        return convertNodeToElement(node, index, transform);
      }
    }
  };

  const options = {
    decodeEntities: true,
    transform,
  };

  return {
    react: serialize(ReactHtmlParser(html, options)),
    references,
  };
};
