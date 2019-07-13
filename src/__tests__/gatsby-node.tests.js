import { makeContentNode, createContentDigest } from '../utils';

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

test('makeContentNode returns Gatsby Node', () => {
  expect(makeContentNode(mockid, mockdata, mockbaseUrl, mockbacklinks)).toEqual(
    expectednode
  );
});
