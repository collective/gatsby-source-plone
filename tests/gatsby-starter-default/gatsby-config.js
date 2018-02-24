module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`
  },
  plugins: [
    {
      resolve: `gatsby-source-plone`,
      options: { baseUrl: `http://localhost:8080/Plone/` },
    },
    `gatsby-plugin-react-helmet`
  ]
};
