import {
  makeContentNode,
  createContentDigest,
  makeNavigationNode,
  makeBreadcrumbsNode,
} from '../utils';

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
