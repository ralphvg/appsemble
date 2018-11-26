import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './Loader.css';

export default class Loader extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    component: PropTypes.string,
  };

  static defaultProps = {
    className: null,
    component: 'div',
  };

  render() {
    const { className, component: Component, ...props } = this.props;

    return <Component className={classNames(styles.loader, className)} {...props} />;
  }
}
