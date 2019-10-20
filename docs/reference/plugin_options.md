# Plugin Options

A sample configuration in `gatsby-config.js` in your Gatsby project, could look like:

```javascript
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-plone',
      options: {
        // The base URL of the Plone site you're using as source
        baseUrl: 'http:///localhost:8080/Plone',

        // Provide authorization token (not required by default)
        // process.env.TOKEN is set by .env
        // Read more about setup in authentication docs
        token: process.env.TOKEN,

        // Additional Plone REST API expansions components to include with
        // each Plone content node (in addition to navigation and breadcrumbs)
        expansions: [],

        // Pass search parameters as an object
        // By default passes no parameters
        searchParams: {
          review_state: 'published',
        },
      },
    },
  ]
};
```
