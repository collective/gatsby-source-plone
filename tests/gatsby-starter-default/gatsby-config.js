require('dotenv').config({
  path: '.env',
});

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
        token: process.env.TOKEN,
        showLogs: true,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/static`,
      },
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sass',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
  ],
};
