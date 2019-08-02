# Configuration of gatsby-source-plone

This Plugin provide some options so that you can add more feature to your website.

# Plugin options
| Key | Description |
|---| --- |
| baseURl | Points to your Plone CMS Url. |
| token   | Your Plone CMS authentication token. Helps you to get private scope data. |
| logLevel| It will provide you additional logging from the plugin. which helps you in debugging your source code. |
| websocketUpdates | You can set websocketUpdates as true and false. If you pass true then it will provide you instant updates to your website when you make any change in data set on Plone CMS.

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