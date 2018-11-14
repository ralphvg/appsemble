import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default class ModalBackground extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    component: PropTypes.string,
  };

  static defaultProps = {
    className: null,
    component: 'div',
  };

  render() {
    const { className, component: Component, onClose, ...props } = this.props;

    return <Component className={classNames('modal-background', className)} {...props} />;
  }
}