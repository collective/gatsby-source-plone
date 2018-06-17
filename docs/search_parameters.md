# Search Parameters

The @search endpoint allows you to pass query string parameters that filters the returned response based on the parameters rather than giving the whole listing of content objects. This allows the plugin to retrieve contents and Gatsby to build way more efficiently.

For example:

```javascript
searchParams: {
  SearchableText: 'example',
}
```

Searches for 'example' in the Plone site and returns only the relevant objects as response.
