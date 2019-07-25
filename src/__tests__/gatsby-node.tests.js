import {
  makeContentNode,
  createContentDigest,
  makeNavigationNode,
  makeBreadcrumbsNode,
  ploneNodeGenerator,
  fetchPloneNavigationNode,
  fetchPloneBreadcrumbsNode,
} from '../utils';

// This import is here to make gatsby-node to appear in overall coverage
import { sourceNodes } from '../gatsby-node';

const mockid = 'http://localhost:8080/Plone';
const mockbaseUrl = 'http://localhost:8080/Plone';
const mockdata = {
  description: '',
  is_folderish: true,
  items: [
    {
      description: '',
      review_state: 'published',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
      _type: 'Document',
    },
    {
      description: 'News on gatsby-source-plone development',
      review_state: 'published',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
      _type: 'Folder',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      review_state: 'published',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
      _type: 'Folder',
    },
    {
      description: '',
      review_state: 'published',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
      _type: 'Folder',
    },
    {
      description: 'Reference documentation',
      review_state: 'published',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
      _type: 'Folder',
    },
    {
      description: 'This is newsItem',
      review_state: 'published',
      title: 'This is newsItem',
      _path: '/this-is-newsitem/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem',
      _type: 'News Item',
    },
    {
      description: 'Lorum Ipsum I am figuring out',
      review_state: 'published',
      title: 'This is newsItem2',
      _path: '/this-is-newsitem2/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem2',
      _type: 'News Item',
    },
  ],
  items_total: 7,
  tiles: {},
  tiles_layout: {},
  title: 'Plone site',
  _path: '/',
  _components: {
    actions: { _path: '/', _id: 'http://localhost:8080/Plone/@actions' },
    breadcrumbs: {
      items: [],
      _path: '/',
      _id: 'http://localhost:8080/Plone/@breadcrumbs',
    },
    navigation: {
      items: [Array],
      _path: '/',
      _id: 'http://localhost:8080/Plone/@navigation',
    },
  },
  _id: 'Plone',
  _type: 'Plone Site',
  _parent: {},
};

const mockbacklinks = new Map();
mockbacklinks.set('/', ['']);
mockbacklinks.set('/examples/event-collection/', ['']);
mockbacklinks.set('/examples/the-news-collection/', ['']);
mockbacklinks.set('/examples/midsummer.jpg/', [
  '/examples/the-news-collection/',
]);

const expectednode = {
  description: '',
  is_folderish: true,
  items: [
    {
      description: '',
      review_state: 'published',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
      _type: 'Document',
    },
    {
      description: 'News on gatsby-source-plone development',
      review_state: 'published',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
      _type: 'Folder',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      review_state: 'published',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
      _type: 'Folder',
    },
    {
      description: '',
      review_state: 'published',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
      _type: 'Folder',
    },
    {
      description: 'Reference documentation',
      review_state: 'published',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
      _type: 'Folder',
    },
    {
      description: 'This is newsItem',
      review_state: 'published',
      title: 'This is newsItem',
      _path: '/this-is-newsitem/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem',
      _type: 'News Item',
    },
    {
      description: 'Lorum Ipsum I am figuring out',
      review_state: 'published',
      title: 'This is newsItem2',
      _path: '/this-is-newsitem2/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem2',
      _type: 'News Item',
    },
  ],
  items_total: 7,
  tiles: {},
  tiles_layout: {},
  title: 'Plone site',
  _path: '/',
  _components: {
    actions: { _path: '/', _id: 'http://localhost:8080/Plone/@actions' },
    breadcrumbs: {
      items: [],
      _path: '/',
      _id: 'http://localhost:8080/Plone/@breadcrumbs',
    },
    navigation: {
      items: [Array],
      _path: '/',
      _id: 'http://localhost:8080/Plone/@navigation',
    },
  },
  _id: 'Plone',
  _type: 'Plone Site',
  _parent: {},
  id: 'http://localhost:8080/Plone',
  internal: {
    contentDigest: createContentDigest(mockdata),
    mediaType: 'text/html',
    type: 'PloneSite',
  },
  _backlinks: [''],
};

const idNavigation = 'http://localhost:8080/Plone/@navigation';
const dataNavigation = {
  items: [
    {
      description: '',
      title: 'Home',
      _path: '/',
      _id: 'http://localhost:8080/Plone',
    },
    {
      description: '',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
    },
    {
      description: 'News on gatsby-source-plone development',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
    },
    {
      description: '',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
    },
    {
      description: 'Reference documentation',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
    },
    {
      description: 'This is newsItem',
      title: 'This is newsItem',
      _path: '/this-is-newsitem/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem',
    },
    {
      description: 'Lorum Ipsum I am figuring out',
      title: 'This is newsItem2',
      _path: '/this-is-newsitem2/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem2',
    },
  ],
  _path: '/',
  _id: 'http://localhost:8080/Plone/@navigation',
};
const pathNavigation = '/';
const expectedNavigationNode = {
  items: [
    {
      description: '',
      title: 'Home',
      _path: '/',
      _id: 'http://localhost:8080/Plone',
    },
    {
      description: '',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
    },
    {
      description: 'News on gatsby-source-plone development',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
    },
    {
      description: '',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
    },
    {
      description: 'Reference documentation',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
    },
    {
      description: 'This is newsItem',
      title: 'This is newsItem',
      _path: '/this-is-newsitem/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem',
    },
    {
      description: 'Lorum Ipsum I am figuring out',
      title: 'This is newsItem2',
      _path: '/this-is-newsitem2/',
      _id: 'http://localhost:8080/Plone/this-is-newsitem2',
    },
  ],
  _path: '/',
  _id: 'http://localhost:8080/Plone/@navigation',
  id: 'http://localhost:8080/Plone/@navigation',
  internal: {
    contentDigest: 'bc6df88262ce7de8a70139c3e4c712d2',
    mediaType: 'application/json',
    type: 'PloneNavigation',
  },
};

const idBreadcrumbs = 'http://localhost:8080/Plone/@breadcrumbs';
const dataBreadcrumbs = {
  items: [],
  _path: '/',
  _id: 'http://localhost:8080/Plone/@breadcrumbs',
};
const pathBreadcrumbs = '/';

const expectedBreadcrumbsNode = {
  items: [],
  _path: '/',
  _id: 'http://localhost:8080/Plone/@breadcrumbs',
  id: 'http://localhost:8080/Plone/@breadcrumbs',
  internal: {
    contentDigest: '42e098df7c173baeefe17561865da7a4',
    mediaType: 'application/json',
    type: 'PloneBreadcrumbs',
  },
};

const idFetchPloneNavigation =
  'http://localhost:8080/Plone/this-is-upperfolder';
const baseUrlNavigation = 'http://localhost:8080/Plone';
const fetchPloneNode = {
  items: [
    {
      description: '',
      title: 'Home',
      _path: '/',
      _id: 'http://localhost:8080/Plone',
    },
    {
      description: '',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
    },
    {
      description: 'News on gatsby-source-plone development',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
    },
    {
      description: '',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
    },
    {
      description: 'Reference documentation',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
    },
    {
      description: 'UpperFolder',
      title: 'This is upperFolder',
      _path: '/this-is-upperfolder/',
      _id: 'http://localhost:8080/Plone/this-is-upperfolder',
    },
  ],
  nodes___NODE: [
    'http://localhost:8080/Plone',
    'http://localhost:8080/Plone/index',
    'http://localhost:8080/Plone/news',
    'http://localhost:8080/Plone/examples',
    'http://localhost:8080/Plone/tutorial',
    'http://localhost:8080/Plone/reference',
    'http://localhost:8080/Plone/this-is-upperfolder',
  ],
  _path: '/this-is-upperfolder/',
  _id: 'http://localhost:8080/Plone/this-is-upperfolder/@navigation',
  id: 'http://localhost:8080/Plone/this-is-upperfolder/@navigation',
  internal: {
    contentDigest: 'c9403d8cfdd7716ad3b581e4fd5719fe',
    mediaType: 'application/json',
    type: 'PloneNavigation',
  },
};

const mockDataNavigation = {
  '@id': 'http://localhost:8080/Plone/this-is-upperfolder/@navigation',
  items: [
    { '@id': 'http://localhost:8080/Plone', description: '', title: 'Home' },
    {
      '@id': 'http://localhost:8080/Plone/index',
      description: '',
      title: 'gatsby-source-plone',
    },
    {
      '@id': 'http://localhost:8080/Plone/news',
      description: 'News on gatsby-source-plone development',
      title: 'News',
    },
    {
      '@id': 'http://localhost:8080/Plone/examples',
      description:
        'A folder with different standard content types that Plone supports out of the box',
      title: 'Examples',
    },
    {
      '@id': 'http://localhost:8080/Plone/tutorial',
      description: '',
      title: 'Tutorial',
    },
    {
      '@id': 'http://localhost:8080/Plone/reference',
      description: 'Reference documentation',
      title: 'Docs',
    },
    {
      '@id': 'http://localhost:8080/Plone/this-is-upperfolder',
      description: 'UpperFolder',
      title: 'This is upperFolder',
    },
  ],
};

const mockfetchPloneget = {
  get: async (url, headers, params) => {
    return {
      data: mockDataNavigation,
    };
  },
};

const idFetchPloneBreadcrumbs =
  'http://localhost:8080/Plone/this-is-upperfolder';
const baseUrlBreadcrumbs = 'http://localhost:8080/Plone';
const fetchBreadcrumbsNode = {
  items: [
    {
      title: 'This is upperFolder',
      _path: '/this-is-upperfolder/',
      _id: 'http://localhost:8080/Plone/this-is-upperfolder',
    },
  ],
  nodes___NODE: ['http://localhost:8080/Plone/this-is-upperfolder'],
  _path: '/this-is-upperfolder/',
  _id: 'http://localhost:8080/Plone/this-is-upperfolder/@breadcrumbs',
  id: 'http://localhost:8080/Plone/this-is-upperfolder/@breadcrumbs',
  internal: {
    contentDigest: '6c731ada1fbb25b29ed3649f5e21f43f',
    mediaType: 'application/json',
    type: 'PloneBreadcrumbs',
  },
};

const mockDataBreadcrumbs = {
  '@id': 'http://localhost:8080/Plone/this-is-upperfolder/@breadcrumbs',
  items: [
    {
      '@id': 'http://localhost:8080/Plone/this-is-upperfolder',
      title: 'This is upperFolder',
    },
  ],
};
const mockfetchPloneBreadcrumbsget = {
  get: async (url, headers, params) => {
    return {
      data: mockDataBreadcrumbs,
    };
  },
};

test('makeContentNode returns Gatsby Node', () => {
  expect(makeContentNode(mockid, mockdata, mockbaseUrl, mockbacklinks)).toEqual(
    expectednode
  );
});

test('makeNavigationNode returns Gatsby Node for Navigation', () => {
  expect(
    makeNavigationNode(idNavigation, dataNavigation, pathNavigation)
  ).toEqual(expectedNavigationNode);
});

test('makeBreadcrumbsNode returns Gatsby Node for Breadcrumbs', () => {
  expect(
    makeBreadcrumbsNode(idBreadcrumbs, dataBreadcrumbs, pathBreadcrumbs)
  ).toEqual(expectedBreadcrumbsNode);
});

test('fetchPloneNavigation returns Gatsby Node for Navigation', async () => {
  const data = await fetchPloneNavigationNode(
    idFetchPloneNavigation,
    '',
    baseUrlNavigation,
    mockfetchPloneget
  );
  expect(data).toEqual(fetchPloneNode);
});

test('fetchPloneBreadcrumbs returns Gatsby Node for Breadcrumbs', async () => {
  const data = await fetchPloneBreadcrumbsNode(
    idFetchPloneBreadcrumbs,
    '',
    baseUrlBreadcrumbs,
    mockfetchPloneBreadcrumbsget
  );
  expect(data).toEqual(fetchBreadcrumbsNode);
});
const generatorid = 'http://localhost:8080/Plone';
const generatorbaseUrl = 'http://localhost:8080/Plone';
const generatorbacklinks = new Map();
generatorbacklinks.set('/', ['']);
generatorbacklinks.set('/examples/event-collection/', ['']);
generatorbacklinks.set('/examples/the-news-collection/', ['']);
generatorbacklinks.set('/examples/midsummer.jpg/', [
  '/examples/the-news-collection/',
]);
generatorbacklinks.set('/this-is-from-alok/', ['']);
const mockDataPloneNodeGenerator = {
  '@components': {
    actions: {
      '@id': 'http://localhost:8080/Plone/@actions',
    },
    breadcrumbs: {
      '@id': 'http://localhost:8080/Plone/@breadcrumbs',
      items: [],
    },
    navigation: {
      '@id': 'http://localhost:8080/Plone/@navigation',
      items: [
        {
          '@id': 'http://localhost:8080/Plone',
          description: '',
          title: 'Home',
        },
        {
          '@id': 'http://localhost:8080/Plone/index',
          description: '',
          title: 'gatsby-source-plone',
        },
        {
          '@id': 'http://localhost:8080/Plone/news',
          description: 'News on gatsby-source-plone development',
          title: 'News',
        },
        {
          '@id': 'http://localhost:8080/Plone/examples',
          description:
            'A folder with different standard content types that Plone supports out of the box',
          title: 'Examples',
        },
        {
          '@id': 'http://localhost:8080/Plone/tutorial',
          description: '',
          title: 'Tutorial',
        },
        {
          '@id': 'http://localhost:8080/Plone/reference',
          description: 'Reference documentation',
          title: 'Docs',
        },
      ],
    },
  },
  '@id':
    'http://localhost:8080/Plone?expand=breadcrumbs%2Cnavigation&expand.navigation.depth%3Aint=1',
  '@type': 'Plone Site',
  description: '',
  id: 'Plone',
  is_folderish: true,
  items: [
    {
      '@id': 'http://localhost:8080/Plone/index',
      '@type': 'Document',
      description: '',
      review_state: 'published',
      title: 'gatsby-source-plone',
    },
    {
      '@id': 'http://localhost:8080/Plone/news',
      '@type': 'Folder',
      description: 'News on gatsby-source-plone development',
      review_state: 'published',
      title: 'News',
    },
    {
      '@id': 'http://localhost:8080/Plone/examples',
      '@type': 'Folder',
      description:
        'A folder with different standard content types that Plone supports out of the box',
      review_state: 'published',
      title: 'Examples',
    },
    {
      '@id': 'http://localhost:8080/Plone/tutorial',
      '@type': 'Folder',
      description: '',
      review_state: 'published',
      title: 'Tutorial',
    },
    {
      '@id': 'http://localhost:8080/Plone/reference',
      '@type': 'Folder',
      description: 'Reference documentation',
      review_state: 'published',
      title: 'Docs',
    },
  ],
  items_total: 5,
  parent: {},
  tiles: {},
  tiles_layout: {},
  title: 'Plone site',
};

const ContentNodeGenerator = {
  description: '',
  is_folderish: true,
  items: [
    {
      description: '',
      review_state: 'published',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
      _type: 'Document',
    },
    {
      description: 'News on gatsby-source-plone development',
      review_state: 'published',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
      _type: 'Folder',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      review_state: 'published',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
      _type: 'Folder',
    },
    {
      description: '',
      review_state: 'published',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
      _type: 'Folder',
    },
    {
      description: 'Reference documentation',
      review_state: 'published',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
      _type: 'Folder',
    },
  ],
  nodes___NODE: [
    'http://localhost:8080/Plone/index',
    'http://localhost:8080/Plone/news',
    'http://localhost:8080/Plone/examples',
    'http://localhost:8080/Plone/tutorial',
    'http://localhost:8080/Plone/reference',
  ],
  items_total: 5,
  tiles: {},
  tiles_layout: {},
  title: 'Plone site',
  _path: '/',
  _components: {
    actions: {
      _path: '/',
      _id: 'http://localhost:8080/Plone/@actions',
    },
    breadcrumbs: {
      items: [],
      _path: '/',
      _id: 'http://localhost:8080/Plone/@breadcrumbs',
      nodes___NODE: [],
    },
    navigation: {
      items: [
        {
          description: '',
          title: 'Home',
          _path: '/',
          _id: 'http://localhost:8080/Plone',
        },
        {
          description: '',
          title: 'gatsby-source-plone',
          _path: '/index/',
          _id: 'http://localhost:8080/Plone/index',
        },
        {
          description: 'News on gatsby-source-plone development',
          title: 'News',
          _path: '/news/',
          _id: 'http://localhost:8080/Plone/news',
        },
        {
          description:
            'A folder with different standard content types that Plone supports out of the box',
          title: 'Examples',
          _path: '/examples/',
          _id: 'http://localhost:8080/Plone/examples',
        },
        {
          description: '',
          title: 'Tutorial',
          _path: '/tutorial/',
          _id: 'http://localhost:8080/Plone/tutorial',
        },
        {
          description: 'Reference documentation',
          title: 'Docs',
          _path: '/reference/',
          _id: 'http://localhost:8080/Plone/reference',
        },
      ],
      nodes___NODE: [
        'http://localhost:8080/Plone',
        'http://localhost:8080/Plone/index',
        'http://localhost:8080/Plone/news',
        'http://localhost:8080/Plone/examples',
        'http://localhost:8080/Plone/tutorial',
        'http://localhost:8080/Plone/reference',
      ],
      _path: '/',
      _id: 'http://localhost:8080/Plone/@navigation',
    },
  },
  _id: 'Plone',
  _type: 'Plone Site',
  _parent: {},
  id: 'http://localhost:8080/Plone',
  internal: {
    contentDigest: '31c5a07f4148c70143631b1267d1d418',
    mediaType: 'text/html',
    type: 'PloneSite',
  },
  _backlinks: [''],
};

const BreadcrumbsNodeGenerator = {
  items: [],
  nodes___NODE: [],
  _path: '/',
  _id: 'http://localhost:8080/Plone/@breadcrumbs',
  id: 'http://localhost:8080/Plone/@breadcrumbs',
  internal: {
    contentDigest: 'a95c27586a9b405da15d523bb7dd9491',
    mediaType: 'application/json',
    type: 'PloneBreadcrumbs',
  },
};

const NavigationNodeGenerator = {
  items: [
    {
      description: '',
      title: 'Home',
      _path: '/',
      _id: 'http://localhost:8080/Plone',
    },
    {
      description: '',
      title: 'gatsby-source-plone',
      _path: '/index/',
      _id: 'http://localhost:8080/Plone/index',
    },
    {
      description: 'News on gatsby-source-plone development',
      title: 'News',
      _path: '/news/',
      _id: 'http://localhost:8080/Plone/news',
    },
    {
      description:
        'A folder with different standard content types that Plone supports out of the box',
      title: 'Examples',
      _path: '/examples/',
      _id: 'http://localhost:8080/Plone/examples',
    },
    {
      description: '',
      title: 'Tutorial',
      _path: '/tutorial/',
      _id: 'http://localhost:8080/Plone/tutorial',
    },
    {
      description: 'Reference documentation',
      title: 'Docs',
      _path: '/reference/',
      _id: 'http://localhost:8080/Plone/reference',
    },
  ],
  nodes___NODE: [
    'http://localhost:8080/Plone',
    'http://localhost:8080/Plone/index',
    'http://localhost:8080/Plone/news',
    'http://localhost:8080/Plone/examples',
    'http://localhost:8080/Plone/tutorial',
    'http://localhost:8080/Plone/reference',
  ],
  _path: '/',
  _id: 'http://localhost:8080/Plone/@navigation',
  id: 'http://localhost:8080/Plone/@navigation',
  internal: {
    contentDigest: '5916e97e1270c25f9fcc5f28ab9823ed',
    mediaType: 'application/json',
    type: 'PloneNavigation',
  },
};

const mockPloneNodeGeneratorget = {
  get: async (url, headers, params) => {
    return {
      data: mockDataPloneNodeGenerator,
    };
  },
};

test('fetchPloneNodeGenerator return all created node after fetching data form Plone CMS', async () => {
  let count = 0;
  for await (const node of ploneNodeGenerator(
    generatorid,
    '',
    generatorbaseUrl,
    [],
    generatorbacklinks,
    mockPloneNodeGeneratorget
  )) {
    if (count === 0) {
      expect(node).toEqual(ContentNodeGenerator);
    }
    if (count === 1) {
      expect(node).toEqual(BreadcrumbsNodeGenerator);
    }
    if (count === 2) {
      expect(node).toEqual(NavigationNodeGenerator);
    }
    count++;
  }
});
