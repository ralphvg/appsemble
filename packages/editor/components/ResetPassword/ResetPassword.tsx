import { Form } from '@appsemble/react-components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import HelmetIntl from '../HelmetIntl';
import messages from './messages';
import styles from './ResetPassword.css';

export interface ResetPasswordProps {
  // XXX ReturnType<actions.user.requestResetPassword>
  requestResetPassword: (email: string) => Promise<void>;
}

export default class ResetPassword extends React.Component<ResetPasswordProps> {
  static propTypes = {
    requestResetPassword: PropTypes.func.isRequired,
  };

  state = {
    email: '',
    error: false,
    submitting: false,
    success: false,
  };

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;

    this.setState({ [target.name]: target.value, error: false });
  };

  onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { email } = this.state;
    const { requestResetPassword } = this.props;

    this.setState({ submitting: true, error: false });

    try {
      await requestResetPassword(email);
      this.setState({ submitting: false, success: true });
    } catch (error) {
      this.setState({ error: true, submitting: false, success: false });
    }
  };

  render(): JSX.Element {
    const { email, error, submitting, success } = this.state;

    return (
      <React.Fragment>
        <HelmetIntl title={messages.title} />
        {success ? (
          <div className={classNames('container', styles.root)}>
            <article className="message is-success">
              <div className="message-body">
                <FormattedMessage {...messages.requestSuccess} />
              </div>
            </article>
          </div>
        ) : (
          <Form className={classNames('container', styles.root)} onSubmit={this.onSubmit}>
            {error && (
              <article className="message is-danger">
                <div className="message-body">
                  <FormattedMessage {...messages.requestFailed} />
                </div>
              </article>
            )}

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label" htmlFor="inputEmail">
                  <FormattedMessage {...messages.emailLabel} />
                </label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control has-icons-left">
                    <input
                      autoComplete="email"
                      className="input"
                      disabled={submitting}
                      id="inputEmail"
                      name="email"
                      onChange={this.onChange}
                      required
                      type="email"
                      value={email}
                    />
                    <span className="icon is-left">
                      <i className="fas fa-envelope" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className={classNames('button', 'is-primary', styles.submit)}
              disabled={submitting}
              type="submit"
            >
              <FormattedMessage {...messages.requestButton} />
            </button>
          </Form>
        )}
      </React.Fragment>
    );
  }
}