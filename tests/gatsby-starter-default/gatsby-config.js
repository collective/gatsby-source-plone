require('dotenv').config({
  path: '.secrets',
});

module.exports = {
  siteMetadata: {
    title: 'Plone plugin for Gatsby',
  },
  pathPrefix: '/gatsby-source-plone',
  plugins: [
    {
      resolve: 'gatsby-source-plone',
      options: {
        baseUrl: 'http://localhost:8080/Plone/',
        token:  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTU2MDU2MDk2MiwiZnVsbG5hbWUiOm51bGx9.OWFRexr_u2sWIltclUrhgy16qrQ1Fjsf-JDPjPoU8rE",
        logLevel: 'DEBUG',
        websocketUpdates: true,
      },
    },
    // Note: gatsby-source-filesystems is required also to make Plone
    // to have publicURL and be downloadable from the gatsby site
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
