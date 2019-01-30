import bcrypt from 'bcrypt';
import request from 'supertest';

import createServer from '../utils/createServer';
import truncate from '../utils/test/truncate';
import testSchema from '../utils/test/testSchema';

describe('auth controller', () => {
  let User;
  let EmailAuthorization;
  let ResetPasswordToken;
  let db;
  let server;

  beforeAll(async () => {
    db = await testSchema('auth');

    server = await createServer({ db });
    ({ User, ResetPasswordToken, EmailAuthorization } = db.models);
  });

  beforeEach(async () => {
    await truncate(db);
  });

  afterAll(async () => {
    await db.close();
  });

  it('should register valid email addresses', async () => {
    const data = { email: 'test@example.com', password: 'password' };
    const response = await request(server)
      .post('/api/email')
      .send(data);

    expect(response.status).toBe(201);

    const email = await EmailAuthorization.findByPk('test@example.com');
    const user = await User.findByPk(email.UserId);

    expect(user).toBeDefined();
    expect(email.password).not.toBe('password');
    expect(bcrypt.compareSync(data.password, email.password)).toBe(true);
  });

  it('should allow users to log in using valid email credentials', async () => {
    await db.models.OAuthClient.create({
      clientId: 'test',
      clientSecret: 'test',
      redirectUri: '/',
    });
    const response = await request(server)
      .post('/api/email')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(201);

    const { body: token } = await request(server)
      .post('/api/oauth/token')
      .type('form')
      .send({
        grant_type: 'password',
        username: 'test@example.com',
        password: 'password',
        client_id: 'test',
      });
    expect(token.access_token).toMatch(/^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/);
  });

  it('should not allow users to log in using an invalid password', async () => {
    await db.models.OAuthClient.create({
      clientId: 'test',
      clientSecret: 'test',
      redirectUri: '/',
    });

    await request(server)
      .post('/api/email')
      .send({ email: 'test@example.com', password: 'password' });

    const response = await request(server)
      .post('/api/oauth/token')
      .type('form')
      .send({
        grant_type: 'password',
        username: 'test@example.com',
        password: 'notPassword',
        client_id: 'test',
      });

    expect(response.status).toBe(401);
  });

  it('should not allow users to log in using invalid credentials', async () => {
    await db.models.OAuthClient.create({
      clientId: 'test',
      clientSecret: 'test',
      redirectUri: '/',
    });

    const response = await request(server)
      .post('/api/oauth/token')
      .type('form')
      .send({
        grant_type: 'password',
        username: 'test@example.com',
        password: 'notPassword',
        client_id: 'test',
      });

    expect(response.status).toBe(401);
  });

  it('should not register invalid email addresses', async () => {
    const response = await request(server)
      .post('/api/email')
      .send({ email: 'foo', password: 'bar' });

    expect(response.status).toBe(400);
  });

  it('should not register duplicate email addresses', async () => {
    await EmailAuthorization.create({ email: 'test@example.com', password: 'unhashed' });
    const response = await request(server)
      .post('/api/email')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(409);
  });

  it('should verify existing email addresses', async () => {
    await request(server)
      .post('/api/email')
      .send({ email: 'test@example.com', password: 'password' });
    const email = await EmailAuthorization.findByPk('test@example.com');

    expect(email.verified).toBe(false);
    expect(email.key).not.toBeNull();

    const response = await request(server).get(`/api/email/verify?key=${email.key}`);
    expect(response.status).toBe(200);

    await email.reload();
    expect(email.verified).toBe(true);
    expect(email.key).toBeNull();
  });

  it('should not verify empty or invalid keys', async () => {
    const responseA = await request(server).get('/api/email/verify');
    const responseB = await request(server).get('/api/email/verify?key');
    const responseC = await request(server).get('/api/email/verify?key=invalidkey');

    expect(responseA.status).toBe(400);
    expect(responseB.status).toBe(404);
    expect(responseC.status).toBe(404);
  });

  it('should create a password reset token', async () => {
    const data = { email: 'test@example.com', password: 'password' };
    await request(server)
      .post('/api/email')
      .send(data);

    const responseA = await request(server)
      .post('/api/email/reset/request')
      .send({ email: data.email });

    const token = await ResetPasswordToken.findOne({
      where: { EmailAuthorizationEmail: data.email },
    });

    const responseB = await request(server)
      .post('/api/email/reset')
      .send({ token: token.token, password: 'newPassword' });

    const email = await token.getEmailAuthorization();
    email.reload();

    expect(responseA.status).toBe(204);
    expect(responseB.status).toBe(204);
    expect(bcrypt.compareSync('newPassword', email.password)).toBe(true);

    // Sequelize throws errors when trying to load in null objects.
    await expect(token.reload()).rejects.toThrow();
  });

  it('should not reveal existing emails', async () => {
    const response = await request(server)
      .post('/api/email/reset/request')
      .send({ email: 'idonotexist@example.com' });

    expect(response.status).toBe(204);
  });

  it('should return not found when resetting using a non-existant token', async () => {
    const response = await request(server)
      .post('/api/email/reset')
      .send({ token: 'idontexist', password: 'whatever' });

    expect(response.status).toBe(404);
  });
});
