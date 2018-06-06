# Expansions

According to [plone.restapi docs](https://plonerestapi.readthedocs.io/en/latest/expansion.html), expansion is a mechanism to embed additional “components”, such as _navigation, breadcrumbs, schema,_ or _workflow_ within the main content response, helping the API consumers to avoid unnecessary requests.

For instance, a normal GET request to `http://localhost:8080/Plone` would give the following response:

```json
{
    "@components": {
        "actions": {
            "@id": "http://localhost:8080/Plone/@actions"
        },
        "breadcrumbs": {
            "@id": "http://localhost:8080/Plone/@breadcrumbs"
        },
        "navigation": {
            "@id": "http://localhost:8080/Plone/@navigation"
        }
    },
    "@id": "http://localhost:8080/Plone",
    "@type": "Plone Site",
    "id": "Plone",
    ...
```

But in the case we need the _breadcrumbs, navigation_ data or so on, we'll need to make more requests to `/@breadcrumbs`, `/@navigation` and more depending on the data we need.

Expansions simplifies this process by retrieving all data in a single request as `http://localhost:8080/Plone?expand=breadcrumbs,navigation` giving the response:

```json
{
    "@components": {
        "actions": {
            "@id": "http://localhost:8080/Plone/@actions"
        },
        "breadcrumbs": {
            "@id": "http://localhost:8080/Plone/@breadcrumbs",
            "items": []
        },
        "navigation": {
            "@id": "http://localhost:8080/Plone/@navigation",
            "items": [
                {
                    "@id": "http://localhost:8080/Plone",
                    "description": "",
                    "title": "Home"
                },
                {
                    "@id": "http://localhost:8080/Plone/news",
                    "description": "News on gatsby-source-plone development",
                    "title": "News"
                },
                {
                    "@id": "http://localhost:8080/Plone/index",
                    "description": "",
                    "title": "gatsby-source-plone"
                },
                {
                    "@id": "http://localhost:8080/Plone/search_traversal",
                    "description": "",
                    "title": "Traversal using @search endpoint"
                },
                {
                    "@id": "http://localhost:8080/Plone/plugin_options",
                    "description": "",
                    "title": "Plugin Options"
                },
                {
                    "@id": "http://localhost:8080/Plone/testcases",
                    "description": "A folder with different standard content types that Plone supports out of the box",
                    "title": "Testcases"
                }
            ]
        }
    },
    "@id": "http://localhost:8080/Plone?expand=breadcrumbs%2Cnavigation",
    "@type": "Plone Site",
    "id": "Plone",
    "is_folderish": true,
    ...
```
