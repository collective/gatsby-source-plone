import {
  normalizeType,
  createContentDigest,
  fetchPlone,
  fetchUrl,
  headersWithToken,
  logging,
  normalizeData,
  normalizePath,
  parentId,
  parseHTMLtoReact,
  urlWithoutParameters,
  serializeParams,
} from '../utils';

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

test('logging.getLogger returns DEBUG level logger', async () => {
  const buffer = [];
  let logger = logging.getLogger(logging.DEBUG, {
    debug: msg => buffer.push(msg),
    info: msg => buffer.push(msg),
    warn: msg => buffer.push(msg),
    error: msg => buffer.push(msg),
    critical: msg => buffer.push(msg),
  });
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.critical('critical');
  expect(buffer).toEqual([
    'Plone – debug',
    'Plone – info',
    'Plone – warn',
    'Plone – error',
    'Plone – critical',
  ]);
});

test('logging.getLogger returns INFO level logger', async () => {
  const buffer = [];
  let logger = logging.getLogger(logging.INFO, {
    debug: msg => buffer.push(msg),
    info: msg => buffer.push(msg),
    warn: msg => buffer.push(msg),
    error: msg => buffer.push(msg),
    critical: msg => buffer.push(msg),
  });
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.critical('critical');
  expect(buffer).toEqual([
    'Plone – info',
    'Plone – warn',
    'Plone – error',
    'Plone – critical',
  ]);
});

test('logging.getLogger returns WARNING level logger', async () => {
  const buffer = [];
  let logger = logging.getLogger(logging.WARNING, {
    debug: msg => buffer.push(msg),
    info: msg => buffer.push(msg),
    warn: msg => buffer.push(msg),
    error: msg => buffer.push(msg),
    critical: msg => buffer.push(msg),
  });
  logger.debug('debug');
  logger.info('info');
  logger.warn('warning');
  logger.error('error');
  logger.critical('critical');
  expect(buffer).toEqual([
    'Plone – warning',
    'Plone – error',
    'Plone – critical',
  ]);
});

test('logging.getLogger returns ERROR level logger', async () => {
  const buffer = [];
  let logger = logging.getLogger(logging.ERROR, {
    debug: msg => buffer.push(msg),
    info: msg => buffer.push(msg),
    warn: msg => buffer.push(msg),
    error: msg => buffer.push(msg),
    critical: msg => buffer.push(msg),
  });
  logger.debug('debug');
  logger.info('info');
  logger.warn('warning');
  logger.error('error');
  logger.critical('critical');
  expect(buffer).toEqual(['Plone – error', 'Plone – critical']);
});

test('logging.getLogger returns CRITICAL level logger', async () => {
  const buffer = [];
  let logger = logging.getLogger(logging.CRITICAL, {
    debug: msg => buffer.push(msg),
    info: msg => buffer.push(msg),
    warn: msg => buffer.push(msg),
    error: msg => buffer.push(msg),
    critical: msg => buffer.push(msg),
  });
  logger.debug('debug');
  logger.info('info');
  logger.warn('warning');
  logger.error('error');
  logger.critical('critical');
  expect(buffer).toEqual(['Plone – critical']);
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
    normalizeData({
      id: '',
      parent: {
        '@id': 'http://localhost:8080/Plone',
      },
      children: [],
    })
  ).toEqual({
    _id: '',
    _parent: {
      _id: 'http://localhost:8080/Plone',
      _path: '/',
      node___NODE: 'http://localhost:8080/Plone',
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
      'http://localhost:8080'
    )
  ).toEqual({
    items: [
      {
        _id: 'http://localhost:8080/Plone',
        _path: '/Plone/',
        node___NODE: 'http://localhost:8080/Plone',
      },
      {
        _id: 'http://localhost:8080/Plone',
        _path: '/Plone/',
        node___NODE: 'http://localhost:8080/Plone',
        items: [
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
            node___NODE: 'http://localhost:8080/Plone',
          },
        ],
      },
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
      'http://localhost:8080'
    )
  ).toEqual({
    _components: {
      example: {
        items: [
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
            node___NODE: 'http://localhost:8080/Plone',
          },
          {
            _id: 'http://localhost:8080/Plone',
            _path: '/Plone/',
            node___NODE: 'http://localhost:8080/Plone',
          },
        ],
      },
    },
  });
});

test('parseHTMLtoReact transforms relative links', async () => {
  const backlinks = new Map();
  const react = parseHTMLtoReact(
    `
<p>
<a href="http://localhost:8080/Plone/foobar">
<img src="http://localhost:8080/Plone/foo/bar.png">
</a>
</p>
`,
    'http://localhost:8080/Plone',
    '/index/',
    backlinks
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
  expect(backlinks).toEqual(
    new Map([['/foobar/', ['/index/']], ['/foo/bar.png/', ['/index/']]])
  );
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
