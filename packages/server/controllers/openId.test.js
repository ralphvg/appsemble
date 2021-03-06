import { createInstance } from 'axios-test-instance';
import lolex from 'lolex';

import createServer from '../utils/createServer';
import testSchema from '../utils/test/testSchema';
import testToken from '../utils/test/testToken';
import truncate from '../utils/test/truncate';

let authorization;
let clock;
let db;
let OAuth2AuthorizationCode;
let request;
let server;
let user;

beforeAll(async () => {
  db = await testSchema('organizations');
  ({ OAuth2AuthorizationCode } = db.models);
  server = await createServer({ db, argv: { host: 'http://localhost', secret: 'test' } });
  request = await createInstance(server);
});

beforeEach(async () => {
  await truncate(db);
  clock = lolex.install();
  clock.setSystemTime(new Date('2000-01-01T00:00:00Z'));
  ({ authorization, user } = await testToken(db));
});

afterEach(() => {
  clock.uninstall();
});

afterAll(async () => {
  await request.close();
  await db.close();
});

describe('getUserInfo', () => {
  it('should return userinfo formatted as defined by OpenID', async () => {
    const response = await request.get('/api/connect/userinfo', { headers: { authorization } });
    expect(response).toMatchObject({
      status: 200,
      data: {
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        picture: 'https://www.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?s=128&d=mp',
        sub: user.id,
      },
    });
  });

  it('should work if the user has no primary email address', async () => {
    await user.update({ primaryEmail: null });
    const response = await request.get('/api/connect/userinfo', { headers: { authorization } });
    expect(response).toMatchObject({
      status: 200,
      data: {
        email: null,
        email_verified: false,
        name: 'Test User',
        picture: null,
        sub: user.id,
      },
    });
  });
});

describe('createAuthorizationCode', () => {
  let organization;

  beforeEach(async () => {
    organization = await user.createOrganization(
      {
        id: 'org',
        name: 'Test Organization',
      },
      { through: { role: 'Owner' } },
    );
  });

  it('should create an authorization code linked to the user and app on a default domain', async () => {
    const app = await organization.createApp({
      path: 'app',
      definition: {},
      vapidPublicKey: '',
      vapidPrivateKey: '',
    });
    const response = await request.post(
      '/api/oauth2/authorization-code',
      { appId: app.id, redirectUri: 'http://app.org.localhost:9999' },
      { headers: { authorization } },
    );
    expect(response).toMatchObject({
      status: 201,
      data: {
        code: expect.stringMatching(/^[0-f]{24}$/),
      },
    });

    const { code } = response.data;
    const authCode = await OAuth2AuthorizationCode.findOne({ raw: true, where: { code } });
    expect(authCode).toStrictEqual({
      AppId: app.id,
      code,
      expires: new Date('2000-01-01T00:10:00.000Z'),
      redirectUri: 'http://app.org.localhost:9999',
      UserId: user.id,
    });
  });

  it('should create an authorization code linked to the user and app on a custom domain', async () => {
    const app = await organization.createApp({
      path: 'app',
      domain: 'app.example',
      definition: {},
      vapidPublicKey: '',
      vapidPrivateKey: '',
    });
    const response = await request.post(
      '/api/oauth2/authorization-code',
      { appId: app.id, redirectUri: 'http://app.example:9999' },
      { headers: { authorization } },
    );
    expect(response).toMatchObject({
      status: 201,
      data: {
        code: expect.stringMatching(/^[0-f]{24}$/),
      },
    });

    const { code } = response.data;
    const authCode = await OAuth2AuthorizationCode.findOne({ raw: true, where: { code } });
    expect(authCode).toStrictEqual({
      AppId: app.id,
      code,
      expires: new Date('2000-01-01T00:10:00.000Z'),
      redirectUri: 'http://app.example:9999',
      UserId: user.id,
    });
  });

  it('should block invalid login attempts', async () => {
    const app = await organization.createApp({
      path: 'app',
      domain: 'app.example',
      definition: {},
      vapidPublicKey: '',
      vapidPrivateKey: '',
    });
    const response = await request.post(
      '/api/oauth2/authorization-code',
      { appId: app.id, redirectUri: 'http://invalid.example:9999' },
      { headers: { authorization } },
    );
    expect(response).toMatchObject({
      status: 403,
      data: {
        error: 'Forbidden',
        message: 'Invalid redirectUri',
        statusCode: 403,
      },
    });
  });

  it('should return 404 for non-existent apps', async () => {
    const response = await request.post(
      '/api/oauth2/authorization-code',
      { appId: 346, redirectUri: 'http://any.example:9999' },
      { headers: { authorization } },
    );
    expect(response).toMatchObject({
      status: 404,
      data: {
        error: 'Not Found',
        message: 'App not found',
        statusCode: 404,
      },
    });
  });
});
