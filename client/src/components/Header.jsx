import React from 'react';
import PropTypes from 'prop-types';

const Header = (props) => {
  const { title, link } = props;
  return (
    <div className="Header">
      <h1>{title}</h1>
      <a href={link} id="github">github</a>
    </div>
  );
};

Header.propTypes = {
  link: PropTypes.string,
  title: PropTypes.string,
};

Header.defaultProps = {
  link: '',
  title: '',
};

export default Header;
