import { normalizePath } from '../util/normalizePath';
import { normalizeType } from '../util/normalizeType';
import { createContentDigest } from '../util/helper';
import { fetchPlone } from '../util/fetchPlone';
import { fetchUrl } from '../util/fetchUrl';
import { headersWithToken } from '../util/fetchUrl';
import { urlWithoutParameters } from '../util/helper';
import { normalizeData } from '../util/normalizeData';
import { parentId } from '../util/helper';
import { parseHTMLtoReact } from '../util/parseHTMLtoReact';
import { serializeParams } from '../util/serializeParams';

test('normalizeType normalizes and normalizeTypes content types', () => {
  expect(normalizeType('Folder')).toBe('PloneFolder');
  expect(normalizeType('PloneSite')).toBe('PloneSite');
  expect(normalizeType('Plone Site')).toBe('PloneSite');
  expect(normalizeType('News Item')).toBe('PloneNewsItem');
  expect(normalizeType('Super News Item')).toBe('PloneSuperNewsItem');
  expect(normalizeType('collective.type')).toBe('PloneCollectiveType');
});

test('createContentDigest creates deterministic digest', () => {
  expect(createContentDigest('data')).toBe('755af0e71655b62611370ead1f20bcae');
});

test('urlWithoutParameters removes query string', () => {
  expect(
    urlWithoutParameters('https://example.com/search?q=examplequery')
  ).toBe('https://example.com/search');
});

test('headersWithToken adds Authorization header', () => {
  expect(headersWithToken({ accept: 'application/json' }, 'token')).toEqual({
    accept: 'application/json',
    Authorization: 'Bearer token',
  });
});

test('normalizePath returns canonical /path/', () => {
  expect(normalizePath('foo')).toBe('/foo/');
  expect(normalizePath('/foo')).toBe('/foo/');
  expect(normalizePath('foo/')).toBe('/foo/');
  expect(normalizePath('/foo/')).toBe('/foo/');
  expect(normalizePath('//foo//')).toBe('/foo/');
  expect(normalizePath(undefined)).toBe('/');
});

test('normalizePath drops /view suffix', () => {
  expect(normalizePath('/foo/view')).toBe('/foo/');
});

test('parentId returns @id of Plone object parent', () => {
  expect(parentId('http://localhost:8080/foo/bar')).toBe(
    'http://localhost:8080/foo'
  );
  expect(parentId('http://localhost:8080/foo')).toBe('http://localhost:8080');
});

test('parentId returns root for Plone root', () => {
  expect(parentId('http://localhost:8080/')).toBe('http://localhost:8080');
  expect(parentId('http://localhost:8080')).toBe('http://localhost:8080');
});

const mock = {
  get: async (url, headers, params) =>
    url !== 'next'
      ? {
          data: {
            ...headers,
            batching: { next: 'next' },
            items: [1],
          },
        }
      : {
          data: {
            ...headers,
            items: [2],
            batching: {},
          },
        },
};

test('fetchUrl sets Authorization header from given token', async () => {
  const data = await fetchUrl('url', 'token', {}, mock);
  expect(data.headers).toEqual({
    Accept: 'application/json',
    Authorization: 'Bearer token',
  });
});

test('fetchPlone fetches all available pages', async () => {
  const data = await fetchPlone('url', 'token', {}, mock);
  expect(data.items).toEqual([1, 2]);
});

test('normalizeData returns empty object as such', async () => {
  expect(normalizeData({})).toEqual({});
});

test('normalizeData maps @id to _id and _path', async () => {
  expect(
    normalizeData({
      '@id': 'http://localhost:8080/Plone',
    })
  ).toEqual({
    _id: 'http://localhost:8080/Plone',
    _path: '/',
  });
});

test('normalizeData prefixes id, parent and children with _', async () => {
  expect(
    normalizeData(
      {
        id: '',
        parent: {
          '@id': 'http://localhost:8080/Plone',
        },
        children: [],
      },
      'http://localhost:8080/Plone'
    )
  ).toEqual({
    _id: '',
    _parent: {
      _id: 'http://localhost:8080/Plone',
      _path: '/',
    },
    _children: [],
  });
});

test('normalizeData excludes node___NODE when @id not in ids', async () => {
  expect(
    normalizeData(
      {
        items: [
          { '@id': 'http://localhost:8080/Plone' },
          {
            '@id': 'http://localhost:8080/Plone',
            items: [{ '@id': 'http://localhost:8080/Plone' }],
          },
        ],
      },
      'http://localhost:8080',
      new Set()
    )
  ).toEqual({
    items: [
      {
        _id: 'http://localhost:8080/Plone',
        _path: '/Plone/',
      },
      {
        _id: 'http://localhost:8080/Plone',
        _path: '/Plone/',
        items: [
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
          },
        ],
        nodes___NODE: [],
      },
    ],
    nodes___NODE: [],
  });
  expect(
    normalizeData(
      {
        id: '',
        parent: {
          '@id': 'http://localhost:8080/Foo',
        },
        children: [],
      },
      'http://localhost:8080/Plone',
      new Set(['http://localhost:8080/Plone'])
    )
  ).toEqual({
    _id: '',
    _parent: {
      _id: 'http://localhost:8080/Foo',
      _path: '/',
    },
    _children: [],
  });
});

test('normalizeData transforms Volto blocksh', async () => {
  expect(
    normalizeData({
      blocks: {
        '022e1d94-c51c-4fc9-8e86-14a7e5eab00d': {
          '@type': 'text',
          text: {
            blocks: [
              {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: 'dhi5a',
                text: 'of a dummy graph.',
                type: 'unstyled',
              },
            ],
            entityMap: {},
          },
        },
      },
    })
  ).toEqual({
    blocks: [
      {
        '@type': 'text',
        _id: '022e1d94-c51c-4fc9-8e86-14a7e5eab00d',
        config:
          '{"text":{"blocks":[{"data":{},"depth":0,"entityRanges":[],"inlineStyleRanges":[],"key":"dhi5a","text":"of a dummy graph.","type":"unstyled"}],"entityMap":{}}}',
      },
    ],
  });
});

test('normalizeData drops /view suffix from id', async () => {
  expect(
    normalizeData(
      {
        id: '',
        parent: {
          '@id': 'http://localhost:8080/Plone/image.png/view',
        },
        children: [],
      },
      'http://localhost:8080/Plone/'
    )
  ).toEqual({
    _id: '',
    _parent: {
      _id: 'http://localhost:8080/Plone/image.png',
      _path: '/image.png/',
    },
    _children: [],
  });
});

test('normalizeData process items recursively', async () => {
  expect(
    normalizeData(
      {
        items: [
          { '@id': 'http://localhost:8080/Plone' },
          {
            '@id': 'http://localhost:8080/Plone',
            items: [{ '@id': 'http://localhost:8080/Plone' }],
          },
        ],
      },
      'http://localhost:8080',
      new Set(['http://localhost:8080/Plone'])
    )
  ).toEqual({
    items: [
      {
        _id: 'http://localhost:8080/Plone',
        _path: '/Plone/',
      },
      {
        _id: 'http://localhost:8080/Plone',
        _path: '/Plone/',
        items: [
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
          },
        ],
        nodes___NODE: ['http://localhost:8080/Plone'],
      },
    ],
    nodes___NODE: [
      'http://localhost:8080/Plone',
      'http://localhost:8080/Plone',
    ],
  });
});

test('normalizeData process @components recursively', async () => {
  expect(
    normalizeData(
      {
        '@components': {
          example: {
            items: [
              { '@id': 'http://localhost:8080/Plone' },
              { '@id': 'http://localhost:8080/Plone' },
            ],
          },
        },
      },
      'http://localhost:8080',
      new Set(['http://localhost:8080/Plone'])
    )
  ).toEqual({
    _components: {
      example: {
        items: [
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
          },
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
          },
        ],
        nodes___NODE: [
          'http://localhost:8080/Plone',
          'http://localhost:8080/Plone',
        ],
      },
    },
  });
});

test('parseHTMLtoReact transforms relative links', async () => {
  const { react, references } = parseHTMLtoReact(
    `
<p>
<a href="http://localhost:8080/Plone/foobar">
<img src="http://localhost:8080/Plone/foo/bar.png/@@images/uuid">
</a>
</p>
`,
    'http://localhost:8080/Plone'
  );
  expect(JSON.parse(react)).toEqual([
    {
      props: {
        children: [
          {
            props: {
              children: [
                {
                  props: {
                    children: [],
                    'data-download':
                      'http://localhost:8080/Plone/foo/bar.png/@@images/uuid',
                    src: '/foo/bar.png/',
                  },
                  type: 'Img',
                },
              ],
              href: null,
              to: '/foobar/',
            },
            type: 'Link',
          },
        ],
      },
      type: 'p',
    },
  ]);
  expect(references).toEqual(['/foobar/', '/foo/bar.png/']);
});

test('serialiseParams serialize paramas into ZPublisher format', () => {
  expect(
    serializeParams({
      portal_type: 'Document',
    })
  ).toBe('portal_type=Document');
  expect(
    serializeParams({
      portal_type: ['Document', 'Folder'],
    })
  ).toBe('portal_type%3Alist=Document&portal_type%3Alist=Folder');
  expect(
    serializeParams({
      numeric_field: 42,
    })
  ).toBe('numeric_field%3Aint=42');
  expect(
    serializeParams({
      numeric_field: 42,
    })
  ).toBe('numeric_field%3Aint=42');
});
