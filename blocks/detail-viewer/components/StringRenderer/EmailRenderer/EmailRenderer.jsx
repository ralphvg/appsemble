import {
  WebLink,
} from 'material-ui-extras';
import React from 'react';
import PropTypes from 'prop-types';

import Definition from '../../Definition';


/**
 * Render an email address as a clickable link.
 */
export default class EmailRenderer extends React.Component {
  static propTypes = {
    /**
     * The current value.
     */
    value: PropTypes.string.isRequired,
  };

  render() {
    const {
      value,
      ...props
    } = this.props;

    return (
      <Definition {...props}>
        {value && (
          <WebLink href={`mailto:${value}`} target="_blank">
            {value}
          </WebLink>
        )}
      </Definition>
    );
  }
}