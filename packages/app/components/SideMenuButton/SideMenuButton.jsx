import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import messages from './messages';
import styles from './SideMenuButton.css';

/**
 * A toolbar button which can be used to open the side menu.
 */
export default class SideMenuButton extends React.Component {
  static propTypes = {
    app: PropTypes.shape().isRequired,
    intl: PropTypes.shape().isRequired,
    isOpen: PropTypes.bool.isRequired,
    openMenu: PropTypes.func.isRequired,
  };

  render() {
    const { app, intl, isOpen, openMenu } = this.props;

    if (!app || app.navigation) {
      return null;
    }

    return (
      <button
        aria-label={intl.formatMessage(messages.label)}
        className={classNames('navbar-burger', { 'is-active': isOpen }, styles.root)}
        onClick={openMenu}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
    );
  }
}
