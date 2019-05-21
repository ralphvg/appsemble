import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default class Control extends React.Component {
  static propTypes = {
    defaultValue: PropTypes.string,
    enum: PropTypes.arrayOf(PropTypes.shape()),
    loading: PropTypes.bool.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  static defaultProps = {
    defaultValue: undefined,
    enum: null,
    value: '',
  };

  render() {
    const { enum: enumerator, defaultValue, loading, value, ...props } = this.props;

    return (
      <div className={classNames('control', { 'is-loading': loading })}>
        {enumerator ? (
          <div className="select is-fullwidth">
            <select value={value} {...props}>
              {!defaultValue && <option />}
              {enumerator.map(({ value: val, label }) => (
                <option key={val} value={val}>
                  {label || val}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input className="input" value={value} {...props} />
        )}
      </div>
    );
  }
}
