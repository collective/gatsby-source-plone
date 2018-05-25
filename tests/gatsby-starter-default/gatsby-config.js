module.exports = {
  siteMetadata: {
    title: 'Gatsby plugin for Plone',
  },
  pathPrefix: '/gatsby-source-plone',
  plugins: [
    {
      resolve: 'gatsby-source-plone',
      options: {
        baseUrl: 'http://localhost:8080/Plone/',
        showLogs: true,
      },
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sass',
  ],
};
