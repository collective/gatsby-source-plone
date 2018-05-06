# gatsby-source-plone

Gatsby is a blazing fast static site generator for React. By using Plone as source, this can be used to generate a static site with PWA features with something equivalent to the click of a button. That’s the essence of the **“Big Green Button”** proposal, according to **Martin Aspeli**, who wrote a blog post **"[Pete and Andy try Plone 4](http://www.martinaspeli.net/articles/pete-and-andy-try-plone-4)"**:

_"Andy goes to Plone's Deployment control panel. There he finds a Big Green Button.
He pushes it and covers his eyes. A minute later, a bunch of static HTML files appear in a directory on the server, covering the Plone site, with basic navigation and a site map. Search is provided via a form that posts to Google for search results on the current site."_

A gatsby-source plugin pulls the whole content tree from the plone.restapi and makes it available for querying via GraphQL in a hierarchical data structure. The gatsby-plone-starter that uses the plugin to source the data from a Plone site will illustrate all use cases of the plugin in a Gatsby project.