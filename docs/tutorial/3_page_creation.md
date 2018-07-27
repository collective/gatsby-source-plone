# Page Creation

After gatsby-source-plone has retrieved all the data and created nodes, these nodes can be used to create pages. For more detail information on page creation, visit the [Gatsby docs](https://www.gatsbyjs.org/docs/creating-and-modifying-pages/#creating-pages-in-gatsby-nodejs).

So let's start by creating pages for each `PloneFolder`:

```javascript
const path = require('path');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // Get data via GraphQL
  const result = await graphql(`
    {
      allPloneFolder {
        edges {
          node {
            _path
          }
        }
      }
    }
  `);

  // Create pages for each PloneFolder item
  result.data.allPloneFolder.edges.forEach(({ node }) => {
    createPage({
      path: node._path,
      component: path.resolve('./src/templates/default.js'),
    });
  });
};
```

Once we've got pages created for each of the, we need to display them in our Gatsby site. For this we have to work on the `default.js` template we previously mentioned:

```javascript
const DefaultLayout = ({ data }) => (
  <Layout>
    {data && data.ploneFolder && <Folder data={data.ploneFolder} />}
  </Layout>
);

export const query = graphql`
  query DefaultTemplateQuery($path: String!) {
    ploneFolder(_path: { eq: $path }) {
      ...Folder
    }
  }
`;
```

Folder component displays the relevant information for an object of type PloneFolder:

```javascript
const Folder = ({ data, title }) => (
  <nav key={data._id}>
    <h1>{title ? title : data.title}</h1>
    <p>
      <strong>{data.description}</strong>
    </p>
    <ul>
      {data.children.filter(child => child.title).map(child => (
        <li key={child._path}>
          <p>
            <Link to={child._path}>{child.title}</Link>
          </p>
          {child.description && <p>{child.description}</p>}
        </li>
      ))}
    </ul>
  </nav>
);

export const query = graphql`
  fragment Folder on PloneFolder {
    id
    title
    description
    children {
      ...SubFolder
    }
    _path
  }

  fragment SubFolder on PloneFolder {
    id
    title
    description
    _path
  }
`;
```

The tree hierarchy established by the plugin is utilized here to get the children of the folder and `SubFolder` GraphQL fragment retrieves the content of folders inside this particular folder and links to them. More information on tree hierarchy in nodes can be found in the [docs](https://collective.github.io/gatsby-source-plone/docs/tree-hierarchy/).

To see it in action, go to `/demo` or any existing folder path and it's details and subfolders displayed.

## Displaying Plone site contents at homepage

To actually view the pages we've created in the gatsby-site, let's display the contents of the Plone site on the homepage:

```javascript
const IndexPage = ({ data }) => (
  <Layout>
    <article>
      <h1>{data.ploneDocument.title}</h1>
      <p>{data.ploneDocument.description}</p>
    </article>
    <Folder data={data.ploneSite} title="Contents" />
  </Layout>
);

export const query = graphql`
  query IndexPageQuery {
    ploneDocument(_path: { eq: "/frontpage/" }) {
      id
      title
      description
    }
    ploneSite(_path: { eq: "/" }) {
      ...Site
    }
  }
`;
```

Site is a fragment defined in the `Folder` component to display the children of the Plone Site (root or baseUrl):

```graphql
{
  fragment
  Site
  on
  PloneSite {
    id
    title
    children {
      ...Folder
    }
    _path
  }
}
```
