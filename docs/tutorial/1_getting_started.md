# Getting Started

## Introduction

We hope you've gone through the [Gatsby documention](https://www.gatsbyjs.org/docs/) and know what it's all about. Also, our docs cover what's the real purpose of this plugin and its use case.

[gatsby-starter-plone](https://github.com/collective/gatsby-starter-plone) is a starter for Gatsby sites with Plone already setup with all the features, and so this tutorial guides you how to work your way from [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default/), adding _gatsby-source-plone_ and implementing features one by one to get _gatsby-starter-plone_ as the end product.
This way the tutorial covers how to **generate a static site from a Plone site using gatsby-source-plone**.

## Setting up

Make sure you have [Gatsby CLI](https://www.gatsbyjs.org/packages/gatsby-cli/) installed globally, get started with _gatsby-starter-default_ and add _gatsby-source-plone_ with basic configuration:

```sh
gatsby new gatsby-starter-plone
yarn add gatsby-source-plone
```

In `gatsby-starter-plone/gatsby-config.js` add:

```js
 plugins: [
    {
      resolve: 'gatsby-source-plone',
      options: {
        // Url of Plone site to use as source
        baseUrl: '<site-url-here>',
        // Show logs while processing nodes
        showLogs: true,
      },
    },
  ],
```

Configuring `gatsby-config.js` is covered in detail in the [plugin options docs](https://collective.github.io/gatsby-source-plone/docs/plugin_options/). Furthermore if your site is protected, go through the [authentication docs](https://collective.github.io/gatsby-source-plone/docs/authentication/) to learn how to setup access with JWT.
