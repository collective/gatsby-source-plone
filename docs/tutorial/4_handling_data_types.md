# Handling different data types

Plone has a couple of native content object types and even custom ones. For these, we need to create separate components for each, and configure `gatsby-node.js` to create individual pages and display the content in a gatsby site.

Firstly step would be creating pages for each of these objects:

```javascript
// gatsby-node.js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allPloneCollection {
        edges {
          node {
            _path
          }
        }
      }
      allPloneDocument {
        edges {
          node {
            _path
          }
        }
      }
      allPloneEvent {
        edges {
          node {
            _path
          }
        }
      }
      allPloneFolder {
        edges {
          node {
            _path
          }
        }
      }
      allPloneNewsItem {
        edges {
          node {
            _path
          }
        }
      }
    }
  `);
  []
    .concat(
      result.data.allPloneCollection.edges,
      result.data.allPloneDocument.edges,
      result.data.allPloneEvent.edges,
      result.data.allPloneFolder.edges,
      result.data.allPloneNewsItem.edges
    )
    .forEach(({ node }) => {
      createPage({
        path: node._path,
        component: path.resolve('./src/templates/default.js'),
      });
    });
};
```

Before we just handled folders, now we query for each of the content object types and create pages for them. The next step would be to configure the default template to handle the data depending on type since we're using it commonly for all of the types.

```javascript
// src/templates/default.js


// Function to return relevant component as per content object type
const componentFor = data => {
  if (data) {
    if (data.ploneCollection) {
      return (
        <Folder
          data={data.ploneCollection}
        />
      );
    } else if (data.ploneDocument) {
      return (
        <Document
          data={data.ploneDocument}
        />
      );
    } else if (data.ploneEvent) {
      return (
        <Event
          data={data.ploneEvent}
        />
      );
    } else if (data.ploneFolder) {
      return (
        <Folder
          data={data.ploneFolder}
        />
      );
    } else if (data.ploneNewsItem) {
      return (
        <NewsItem
          data={data.ploneNewsItem}
        />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const DefaultLayout = ({ data }) => <Layout>{componentFor(data)}</Layout>;

// Query for all the different types from GraphQL
// Fragments for each type are defined in their relevant components
export const query = graphql`
  query DefaultTemplateQuery($path: String!) {
    ploneCollection(_path: { eq: $path }) {
      ...Collection
    }
    ploneDocument(_path: { eq: $path }) {
      ...Document
    }
    ploneEvent(_path: { eq: $path }) {
      ...Event
    }
    ploneFolder(_path: { eq: $path }) {
      ...Folder
    }
    ploneNewsItem(_path: { eq: $path }) {
      ...NewsItem
    }
  }
```

Now all you need to do is design each component. Similar to the Folder component we already have, different components can be built depending on the data passed in and to be displayed.
