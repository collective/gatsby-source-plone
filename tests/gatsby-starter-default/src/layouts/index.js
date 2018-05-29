import React from 'react';
import PropTypes from 'prop-types';
import Link from 'gatsby-link';
import Helmet from 'react-helmet';

import './../styles/bootstrap.scss';

const Header = () => (
  <div className={'jumbotron'}>
    <div className={'container'}>
      <h1 className={'display-4'}>Gatsby plugin for Plone</h1>
      {
        <p>
          <Link className={'btn btn-primary btn-lg'} to="/">
            Learn more &raquo;
          </Link>
        </p>
      }
    </div>
  </div>
);

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet title="Gatsby plugin for Plone" />
    <Header />
    <div className={'container'}>
      <div className={'row'}>
        <div className={'col-12'}>{children()}</div>
      </div>
    </div>
  </div>
);

TemplateWrapper.propTypes = {
  children: PropTypes.func,
};

export default TemplateWrapper;
