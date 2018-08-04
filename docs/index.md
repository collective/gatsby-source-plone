# gatsby-source-plone

[GatsbyJS](https://www.gatsbyjs.org/) is a generator for blazing fast static web sites or web apps powered by pre-rendered [ReactJS](https://reactjs.org/). With this plugin, you can build any amount of gatsby sites from a single [Plone CMS](https://plone.org/), the ultimate open source enterprise CMS.

This gatsby-source plugin pulls the whole content tree from a Plone site (or its sub-folder) using [Plone REST API](https://plonerestapi.readthedocs.io/en/latest/) and makes it available for querying via GraphQL in a Gatsby based project.

Common use-cases include to

* spin-off practically unlimited amount of individually hosted, branded and featured static sites from content managed in a single Plone instance without side-effects to the Plone instance in question

* allow mixed use of Plone, where small individually branded ˝poster sites˝ could be published from larger Plone site with unified theme without need for hosting secondary CMS instances for a such need

* build mash-ups mixin Plone content with content from file-system or other sources.

No Plone knowledge should be required to use this plugin. Just follow the examples in gatsby-starter-plone and the official Gatsby user documentation.

A Plone add-on [collective.webhook](https://pypi.org/project/collective.webhook/) can be used to trigger CI pipelines to rebuild and deploy sites after any change in Plone content.

_˝Andy goes to Plone’s Deployment control panel. There he finds a Big Green Button.
He pushes it and covers his eyes. A minute later, a bunch of static HTML files appear in a directory on the server, covering the Plone site, with basic navigation and a site map. Search is provided via a form that posts to Google for search results on the current site.˝_ –Martin Aspeli, 2009, ˝[Pete and Andy try Plone 4](http://www.martinaspeli.net/articles/pete-and-andy-try-plone-4)˝
