# Navigation

To navigate and traverse through the site easily, Navbar and Breadcrumbs are vital. The plugin processes and provides this data directly from the Plone site so that we don't have to worry about it can directly query using GraphQL.

## Breadcrumbs

Since breadcrumbs depend on the page you are in, it needs to be dynamically created for each page. And so the approach is to query it in each page and pass it on to the `Layout` component.

```graphql
  ploneBreadcrumbs(_path: { eq: $path }) {
    items {
      _id
      _path
      title
    }
  }
```

This retrives breadcrumb data for a particular page during creation and can be passed into `Layout`, where it is used in a `Breadcrumbs` component, which could be as simple as this:

```javascript
// src/components/Breadcrumbs.js

const Breadcrumbs = ({ data }) => (
  <nav className="breadcrumb-container">
    <ol className="breadcrumb">
      <li className="breadcrumb-item">
        <Link to="/">Home</Link>
      </li>
      {data.items.map(item => (
        <li key={item._id} className="breadcrumb-item">
          <Link to={item._path}>{item.title}</Link>
        </li>
      ))}
    </ol>
  </nav>
);
```

## NavBar

This is the common topbar in all the views of the site, that allows quick jumping between root folders or so (depending on customization). So unlike breadcrumbs, we can use a static query (which queries data initially and then just uses existing data):

```javascript
// src/components/Navbar.js

// Major difference would be the Static Query
const NavBar = () => (
  <StaticQuery
    query={graphql`
      query NavbarQuery {
        ploneNavigation(_path: { eq: "/" }) {
          items {
            _id
            _path
            title
          }
        }
      }
    `}
    render={data => (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            Gatsby Starter Plone
          </Link>
          <ol className="navbar-menu">
            <li className="navbar-item">
              <Link to="/">Home</Link>
            </li>
            {data.ploneNavigation.items
              .filter(node => node._path !== '/')
              .map(item => (
                <li key={item._id} className="navbar-item">
                  <Link to={item._path}>{item.title}</Link>
                </li>
              ))}
          </ol>
        </div>
      </nav>
    )}
  />
);
```

Then all you need to do is add this to the top of your `Header` in `Layout`.
