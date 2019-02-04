import fs from 'fs';
import path from 'path';

import { logger } from '@appsemble/node-utils';
import * as Sentry from '@sentry/node';
import yaml from 'js-yaml';
import Koa from 'koa';

import loggerMiddleware from '../middleware/logger';
import configureStatic from '../utils/configureStatic';
import createServer from '../utils/createServer';
import setupModels from '../utils/setupModels';
import databaseBuilder from './builder/database';

export const PORT = 9999;
export const command = 'start';
export const description = 'Start the Appsemble server';

export function builder(yargs) {
  return databaseBuilder(yargs)
    .option('sentry-dsn', {
      desc: 'The Sentry DSN to use for error reporting. See https://sentry.io for details.',
    })
    .option('smtp-host', {
      desc: 'The host of the SMTP server to connect to.',
    })
    .option('smtp-port', {
      desc: 'The port of the SMTP server to connect to.',
      type: 'number',
    })
    .option('smtp-secure', {
      desc: 'Use TLS when connecting to the SMTP server.',
      type: 'boolean',
      default: false,
    })
    .option('smtp-user', {
      desc: 'The user to use to login to the SMTP server.',
      implies: ['smtp-pass', 'smtp-from'],
    })
    .option('smtp-pass', {
      desc: 'The password to use to login to the SMTP server.',
      implies: ['smtp-user', 'smtp-from'],
    })
    .option('smtp-from', {
      desc: 'The address to use when sending emails.',
      implies: ['smtp-user', 'smtp-pass'],
    })
    .option('oauth-google-key', {
      desc: 'The application key to be used for Google OAuth2.',
      implies: ['host', 'oauth-google-secret'],
    })
    .option('oauth-google-secret', {
      desc: 'The secret key to be used for Google OAuth2.',
      implies: ['host', 'oauth-google-key'],
    })
    .option('oauth-gitlab-key', {
      desc: 'The application key to be used for GitLab OAuth2.',
      implies: ['host', 'oauth-gitlab-secret'],
    })
    .option('oauth-gitlab-secret', {
      desc: 'The secret key to be used for GitLab OAuth2.',
      implies: ['host', 'oauth-gitlab-key'],
    })
    .option('oauth-secret', {
      desc: 'Secret key used to sign JWTs and cookies',
      default: 'appsemble',
    })
    .option('host', {
      desc:
        'The external host on which the server is available. This should include the protocol, hostname, and optionally port.',
    });
}

export async function handler(argv, webpackConfigs) {
  const db = await setupModels({
    host: argv.databaseHost,
    dialect: argv.databaseDialect,
    port: argv.databasePort,
    username: argv.databaseUser,
    password: argv.databasePassword,
    database: argv.databaseName,
    uri: argv.databaseUrl,
  });

  const smtp = argv.smtpHost
    ? {
        port: argv.smtpPort || argv.smtpSecure ? 465 : 587,
        host: argv.smtpHost,
        secure: argv.smtpSecure,
        ...(argv.smtpUser &&
          argv.smtpPass && { auth: { user: argv.smtpUser, pass: argv.smtpPass } }),
        from: argv.smtpFrom,
      }
    : undefined;

  const app = new Koa();
  app.use(loggerMiddleware());
  await configureStatic(app, webpackConfigs);
  if (argv.sentryDsn) {
    Sentry.init({ dsn: argv.sentryDsn });
    app.use(async (ctx, next) => {
      ctx.state.sentryDsn = argv.sentryDsn;
      await next();
    });
  }
  app.on('error', (err, ctx) => {
    logger.error(err);
    Sentry.withScope(scope => {
      scope.setTag('ip', ctx.ip);
      scope.setTag('level', 'error');
      scope.setTag('method', ctx.method);
      scope.setTag('url', `${ctx.URL}`);
      scope.setTag('User-Agent', ctx.headers['user-agent']);
      Sentry.captureException(err);
    });
  });

  let grantConfig;
  if (argv.oauthGitlabKey || argv.oauthGoogleKey) {
    const { protocol, host } = new URL(argv.host);
    grantConfig = {
      server: {
        protocol: protocol.replace(':', ''), // URL.protocol leaves a ´:´ in.
        host,
        path: '/api/oauth',
        callback: '/api/oauth/callback',
      },
      ...(argv.oauthGitlabKey && {
        gitlab: {
          key: argv.oauthGitlabKey,
          secret: argv.oauthGitlabSecret,
          scope: ['read_user'],
          callback: '/api/oauth/callback/gitlab',
        },
      }),
      ...(argv.oauthGoogleKey && {
        google: {
          key: argv.oauthGoogleKey,
          secret: argv.oauthGoogleSecret,
          scope: ['email', 'profile', 'openid'],
          callback: '/api/oauth/callback/google',
          custom_params: { access_type: 'offline' },
        },
      }),
    };
  }

  await createServer({ app, db, grantConfig, smtp, secret: argv.oauthSecret });
  const { info } = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../api/api.yaml')));

  app.listen(argv.port || PORT, '0.0.0.0', () => {
    logger.info(info.description);
  });
}