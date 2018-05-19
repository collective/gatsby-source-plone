# Traversal using @search endpoint

In the [plone.restapi](https://github.com/plone/plone.restapi), the `@search` endpoint when fetched without any query returns the full list of content objects. This is used to pull the whole content tree and create nodes with tree hierarchy.

The procedure followed for this:

1.  Use the `@search` endpoint to get a flat list of all content objects.
    For instance, `https://plonedemo.kitconcept.com/en/@search` gives the response:

```json
{
    "@id": "https://plonedemo.kitconcept.com/en/@search",
    "items": [
        {
            "@id": "https://plonedemo.kitconcept.com/en",
            "@type": "LRF",
            "description": "",
            "review_state": "published",
            "title": "English"
        },
        {
            "@id": "https://plonedemo.kitconcept.com/en/frontpage",
            "@type": "Document",
            "description": "The ultimate Open Source Enterprise CMS",
            "review_state": "published",
            "title": "Welcome to Plone 5"
        },
        {
            "@id": "https://plonedemo.kitconcept.com/en/demo/a-page",
            "@type": "Document",
            "description": "Aenean dictum auctor elit, in volutpat ipsum venenatis at. Quisque lobortis augue et enim venenatis interdum. In egestas, est at condimentum ultrices, tortor enim malesuada nulla; vel sagittis nullam.",
            "review_state": "published",
            "title": "A Page"
        },
        ...
```

The `items` is an array of all the content objects.

2.  Using this flat list, iterate through the `@id` attributes making individual requests for each content object to get full data.
    From the previous request, we extract the `@id`s forming a list of URLs for each content object:

```
https://plonedemo.kitconcept.com/en
https://plonedemo.kitconcept.com/en/frontpage
https://plonedemo.kitconcept.com/en/demo/a-page
...
```

Each request will fetch the required data of the content object:

```json
// https://plonedemo.kitconcept.com/en/demo/a-page
{
    "@components": {
        "breadcrumbs": {
            "@id": "https://plonedemo.kitconcept.com/en/demo/a-page/@breadcrumbs"
        },
        "navigation": {
            "@id": "https://plonedemo.kitconcept.com/en/demo/a-page/@navigation"
        },
        "workflow": {
            "@id": "https://plonedemo.kitconcept.com/en/demo/a-page/@workflow"
        }
    },
    "@id": "https://plonedemo.kitconcept.com/en/demo/a-page",
    "@type": "Document",
    "UID": "eb023ac4d6cd4446ae692cdfd5058e91",
    "allow_discussion": null,
    "changeNote": "",
    "contributors": [],
    "created": "2015-07-31T15:42:54+02:00",
    ...
```

3.  Spread this data to nodes (making them available for GraphQL requests in Gatsby)

4.  For hierarchy, _Gatsby at node level uses a 'parent' and 'children' property_. From the data retrieved parent will be assigned from `parent` attribute of the object directly, while children is an array of `@id` which is obtained by traversal of `items` attribute of a content object. This is possible considering that `node.id` is the `@id` attribute.
