import crypto from 'crypto';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default function oauth2Model({ db, secret }) {
  const { EmailAuthorization, OAuthAuthorization, OAuthClient } = db.models;

  return {
    async generateAccessToken(client, user, scope) {
      return jwt.sign(
        {
          scopes: scope,
          client_id: client.id,
        },
        secret,
        {
          issuer: 'appsemble-api',
          subject: `${user.id}`,
          expiresIn: 10800, // expires in 3 hours
        },
      );
    },

    async generateRefreshToken() {
      return crypto.randomBytes(40).toString('hex');
    },

    async getAccessToken(accessToken) {
      const token = await OAuthAuthorization.findOne({ where: { token: accessToken } });

      if (!token) {
        return null;
      }

      try {
        const payload = jwt.verify(accessToken, secret);
        return {
          accessToken,
          accessTokenExpiresAt: new Date(payload.exp * 1000),
          scope: payload.scopes,
          client: { id: payload.client_id },
          user: { id: payload.sub },
        };
      } catch (err) {
        return null;
      }
    },

    async getRefreshToken(refreshToken) {
      const token = await OAuthAuthorization.findOne({ where: { refreshToken } });

      if (!token) {
        return null;
      }

      try {
        const dec = jwt.verify(refreshToken, secret);
        return {
          refreshToken,
          scope: dec.scopes,
          client: { id: dec.client_id },
          user: { id: dec.sub },
        };
      } catch (err) {
        return null;
      }
    },

    async getClient(clientId, clientSecret) {
      const clause = clientSecret ? { clientId, clientSecret } : { clientId };
      const client = await OAuthClient.findOne({ where: clause });

      if (!client) {
        return false;
      }

      return {
        id: client.clientId,
        secret: client.clientSecret,
        redirect_uris: [client.redirectUri],
        grants: ['password', 'refresh_token'],
      };
    },

    async getUser(username, password) {
      const user = await EmailAuthorization.findOne({ where: { email: username } }, { raw: true });

      if (!(user || bcrypt.compareSync(password, user.password))) {
        return false;
      }

      return { id: user.UserId, verified: user.verified, email: user.email, name: user.name };
    },

    async saveToken(token, client, user) {
      await OAuthAuthorization.create({
        token: token.accessToken,
        refreshToken: token.refreshToken,
        UserId: user.id,
      });

      return {
        ...token,
        user,
        client,
      };
    },

    async revokeToken(token) {
      try {
        await OAuthAuthorization.destroy({ where: { refreshToken: token.refreshToken } });
        return true;
      } catch (e) {
        return false;
      }
    },

    // XXX: Implement when implementing scopes
    // async validateScope(user, client, scope) {
    // },
  };
}