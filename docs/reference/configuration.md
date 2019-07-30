# Configuration of gatsby-source-plone

This Plugin provide some options so that you can add more feature to your website.

# How to use
```Javascript
  plugins: [
    {
      resolve: 'gatsby-source-plone',
      options: {
        baseUrl: 'http://localhost:8080/Plone/',
        token: process.env.TOKEN,
        logLevel: 'DEBUG',
        websocketUpdates: true || false,
      },
    },
  ]
```
* baseUrl : Points to your Plone CMS Url
* token : If you provide token as options plugin will be able to fetch our private field data also.
* logLevel : This will provide additional logging for the plugin. Basically this will provide a debugging environment.
* websocketUpdates: You can set websocketUpdates as true and false. True will enable the Gatsby Preview for your site. It shows you instant update when you made some changes to Plone CMS.