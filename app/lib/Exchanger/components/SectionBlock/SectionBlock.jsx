import React from 'react';
import PropTypes from 'prop-types';

// Styles
import './SectionBlock.scss';

function SectionBlock({ className, title, children }) {
  return (
    <div className={`SectionBlock ${className}`}>
      <div className={`SectionBlock__title ${className}__title`}>{title}</div>
      <div className={`SectionBlock__content ${className}__content`}>{children}</div>
    </div>
  );
}

SectionBlock.propTypes = {
  className: PropTypes.string,
  title: PropTypes.any,
  children: PropTypes.any,
};

SectionBlock.defaultProps = {
  className: '',
  title: '',
  children: '',
};

export default SectionBlock;
