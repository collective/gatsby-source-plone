# Customizing search Parameters

Plone REST API @search endpoint allows you to pass query string parameters that filters the returned response based on the parameters rather than giving the whole listing of content objects.

For example

```javascript
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-plone',
      options: {
        SearchableText: 'example',
      },
    }
  ]
}
```

searches for 'example' in the Plone site and returns only the relevant objects as response.
