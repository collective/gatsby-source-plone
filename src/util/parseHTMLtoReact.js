import { normalizePath } from './normalizePath';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import { serialize } from 'react-serialize';

export const parseHTMLtoReact = (html, baseUrl) => {
  const references = [];

  const transform = (node, index) => {
    // Replace hyperlinks with relative links
    if (node.type === 'tag' && node.name === 'a') {
      if (node.attribs.href && node.attribs.href.startsWith(baseUrl)) {
        node.attribs.to = normalizePath(node.attribs.href.split(baseUrl)[1]);
        node.attribs.href = null;
        node.name = 'Link';
        references.push(node.attribs.to);
        return convertNodeToElement(node, index, transform);
      }
    }

    // Replace image src with relative paths
    if (node.type === 'tag' && node.name === 'img') {
      if (node.attribs.src && node.attribs.src.startsWith(baseUrl)) {
        node.attribs['data-download'] = node.attribs.src;
        node.attribs.src = normalizePath(
          node.attribs.src.split(baseUrl)[1].split('/@@images')[0]
        );
        node.name = 'Img';
        references.push(node.attribs.src);
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
