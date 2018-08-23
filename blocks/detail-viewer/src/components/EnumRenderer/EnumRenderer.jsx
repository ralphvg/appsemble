import PropTypes from 'prop-types';
import React from 'react';

import Definition from '../Definition';


/**
 * Render a selected enum value. The first value is used as a fallback.
 */
export default class EnumRenderer extends React.Component {
  static propTypes = {
    /**
     * The current value.
     */
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  };

  static defaultProps = {
    value: null,
  };

  render() {
    const {
      value,
      ...props
    } = this.props;

    return (
      <Definition {...props}>
        {value == null ? props.schema.enum[0] : value}
      </Definition>
    );
  }
}