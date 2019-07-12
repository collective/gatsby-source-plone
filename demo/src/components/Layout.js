import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'gatsby';

import Breadcrumbs from './Breadcrumbs';
import NavBar from './NavBar';

import '../styles/index.scss';

const Header = () => (
  <div className="jumbotron">
    <div className="display-4">Plone plugin for Gatsby</div>
    <p className="lead">
      One Plone site as CMS, unlimited individually branded deployments with
      Gatsby.
    </p>
    <p className="lead">
      <Link
        className={'btn btn-primary btn-lg'}
        to="/tutorial/1_getting_started/"
      >
        Learn more &raquo;
      </Link>
    </p>
  </div>
);

const Layout = ({ breadcrumbs, children, title }) => {
  const node = children.length ? children[0].props.data : children.props.data;
  const active = node ? (node._path === '/index/' ? '/' : node._path) : null;
  return (
    <div className="container-fluid">
      <Helmet
        title={`${title ? title : node.title} – Gatsby source plugin for Plone`}
      />
      <div className="row no-gutters'">
        <NavBar active={active} />
        <div className="col-12">
          {node && node._path === '/index/' ? <Header /> : null}
          {breadcrumbs ? (
            <Breadcrumbs data={breadcrumbs} active={active} />
          ) : null}
          <div className="main-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Layout;
