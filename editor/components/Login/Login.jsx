import querystring from 'querystring';

import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import EmailLogin from '../../../app/components/EmailLogin';

export default class Login extends React.Component {
  state = {};

  static propTypes = {
    oauthLogin: PropTypes.func.isRequired,
  };

  async componentDidMount() {
    const { location } = this.props;
    console.log(this.props);

    if (location.search) {
      const { access_token: accessToken, verified, userId } = querystring.parse(
        location.search.substr(1),
      );

      if (!accessToken || !verified || !userId) {
        return;
      }

      this.handleOAuthLogin();
    }
  }

  async handleOAuthLogin() {
    const { authentication, location, history, oauthLogin } = this.props;
    const qs = querystring.parse(location.search.substr(1));
    console.log(qs);

    oauthLogin(
      authentication.url,
      qs.access_token,
      qs.refresh_token,
      authentication.refreshURL,
      authentication.clientId,
      authentication.clientSecret,
      authentication.scope,
    );

    // Remove all login-related parameters in the query string but keep all the other values it might have.
    delete qs.name;
    delete qs.id;
    delete qs.email;
    delete qs.access_token;
    delete qs.refresh_token;
    delete qs.provider;
    delete qs.verified;
    delete qs.userId;
    history.replace({ ...location, search: querystring.stringify(qs) });
  }

  async handleOAuthRegister() {
    const { location } = this.props;
    const qs = querystring.parse(location.search.substr(1));
    const { provider, access_token: accessToken, refresh_token: refreshToken, id } = qs;

    const result = await axios.post('/api/oauth/register', {
      accessToken,
      provider,
      refreshToken,
      id,
    });

    if (result.status === 201) {
      this.handleOAuthLogin();
    }

    return result;
  }

  render() {
    const {
      authentication,
      location,
      user: { initialized },
    } = this.props;

    const { provider, access_token: accessToken, id, name, email } = querystring.parse(
      location.search.substr(1),
    );

    return accessToken && provider && initialized ? (
      <div>
        <FormattedMessage {...messages.greeting} values={{ id, name, email }} />
        <br />
        <FormattedMessage {...messages.registerPrompt} values={{ provider }} />
        <button onClick={() => this.handleOAuthRegister()} type="button">
          <FormattedMessage {...messages.register} />
        </button>
      </div>
    ) : (
      <div>
        <EmailLogin
          key="appsemble-editor-email-login"
          authentication={{
            method: 'email',
            ...authentication,
          }}
        />
        <div>
          <a href="/api/oauth/connect/google">
            <FormattedMessage {...messages.login} values={{ provider: <span>Google</span> }} />
          </a>
          <a href="/api/oauth/connect/gitlab">
            <FormattedMessage {...messages.login} values={{ provider: <span>GitLab</span> }} />
          </a>
        </div>
      </div>
    );
  }
}
