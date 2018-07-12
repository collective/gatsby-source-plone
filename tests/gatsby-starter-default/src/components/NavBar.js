import React from 'react';
import { graphql, Link, StaticQuery } from 'gatsby';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { EXPAND_NAVIGATION, COLLAPSE_NAVIGATION } from '../state/createStore';
import MdHome from 'react-icons/lib/md/home';
import GoChevronRight from 'react-icons/lib/go/chevron-right';

const NavBar = ({ active, toggleNavigation, navigationExpanded }) => (
  <StaticQuery
    query={graphql`
      query NavbarQuery {
        ploneSite(_path: { eq: "/" }) {
          ...PloneSite
        }
      }
    `}
    render={data => (
      <nav className="navbar navbar-expand-md navbar-light bg-light col-12">
        <span className="navbar-brand">
          <Link className="nav-link" to="/">
            <MdHome /> GatsbyPlone
          </Link>
        </span>
        <button
          className="navbar-toggler"
          // eslint-disable-next-line
          aria-controls="navbarSupportedContent"
          aria-expanded={navigationExpanded ? 'true' : 'false'}
          aria-label="Toggle navigation"
          type="button"
          onClick={() => toggleNavigation(navigationExpanded)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className={
            navigationExpanded
              ? 'collapse navbar-collapse show'
              : 'collapse navbar-collapse'
          }
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mr-auto">
            {data.ploneSite._components.navigation.items.map(node => (
              <li className="nav-item" key={node._id}>
                <Link
                  className={
                    node._path === active ? 'nav-link active' : 'nav-link'
                  }
                  to={node._path}
                >
                  <GoChevronRight className="hide-md-up" />
                  {node.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    )}
  />
);

NavBar.propTypes = {
  navigationExpanded: PropTypes.bool.isRequired,
  toggleNavigation: PropTypes.func.isRequired,
  active: PropTypes.string.isRequired,
};

const mapStateToProps = ({ navigationExpanded }) => {
  return { navigationExpanded };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleNavigation: expanded =>
      expanded
        ? dispatch({ type: COLLAPSE_NAVIGATION })
        : dispatch({ type: EXPAND_NAVIGATION }),
  };
};

const ConnectedNavBar = connect(mapStateToProps, mapDispatchToProps)(NavBar);

export default ConnectedNavBar;
