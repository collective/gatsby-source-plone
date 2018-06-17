# Plugin Options

A sample configuration in `gatsby-config.js` in your Gatsby project, would look like:

```javascript
plugins: [
  {
    resolve: 'gatsby-source-plone',
    options: {
      // The base URL of the Plone site you're using as source
      baseUrl: 'localhost:8080/Plone',

      // Provide authorization token (not required by default)
      // process.env.TOKEN is set by .env
      // Read more about setup in authentication docs
      token: process.env.TOKEN,

      // Pass search parameters as an object
      // By default passes no parameters
      searchParams: {
        SearchableText: 'tree',
      },

      // Expands passed components
      // Accepts components list as an array
      // Defaults to ['breadcrumbs', 'navigation']
      expansions: ['breadcrumbs', 'actions'],

      // Show logs of progress as plugin is run
      // Defaults to false
      showLogs: true,
    },
  },
],
```
