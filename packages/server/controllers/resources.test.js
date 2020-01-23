import { createInstance } from 'axios-test-instance';
import lolex from 'lolex';

import createServer from '../utils/createServer';
import testSchema from '../utils/test/testSchema';
import testToken from '../utils/test/testToken';
import truncate from '../utils/test/truncate';

let App;
let Resource;
let db;
let request;
let server;
let token;
let organizationId;
let clock;
let user;

const exampleApp = orgId => ({
  definition: {
    name: 'Test App',
    defaultPage: 'Test Page',
    resources: {
      testResource: {
        schema: {
          type: 'object',
          required: ['foo'],
          properties: { foo: { type: 'string' } },
        },
      },
      testResourceB: {
        schema: {
          type: 'object',
          required: ['foo'],
          properties: { bar: { type: 'string' } },
        },
      },
    },
  },
  path: 'test-app',
  vapidPublicKey: 'a',
  vapidPrivateKey: 'b',
  OrganizationId: orgId,
});

beforeAll(async () => {
  db = await testSchema('resources');
  server = await createServer({ db, argv: { host: window.location, secret: 'test' } });
  request = await createInstance(server);
  ({ App, Resource } = db.models);
}, 10e3);

beforeEach(async () => {
  await truncate(db);
  ({ authorization: token, user } = await testToken(db));
  ({ id: organizationId } = await user.createOrganization(
    {
      id: 'testorganization',
      name: 'Test Organization',
    },
    { through: { role: 'Maintainer' } },
  ));
  clock = lolex.install();
});

afterEach(() => {
  clock.uninstall();
});

afterAll(async () => {
  await request.close();
  await db.close();
});

describe('getResourceById', () => {
  it('should be able to fetch a resource', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resource = await app.createResource({ type: 'testResource', data: { foo: 'bar' } });
    const response = await request.get(`/api/apps/${app.id}/resources/testResource/${resource.id}`);

    expect(response).toMatchObject({
      status: 200,
      data: {
        id: resource.id,
        foo: 'bar',
        $created: new Date(0).toJSON(),
        $updated: new Date(0).toJSON(),
      },
    });
  });

  it('should not be able to fetch a resources of a different app', async () => {
    const appA = await App.create(exampleApp(organizationId));
    const appB = await App.create({ ...exampleApp(organizationId), path: 'app-b' });

    const resource = await appA.createResource({ type: 'testResource', data: { foo: 'bar' } });
    const responseA = await request.get(
      `/api/apps/${appB.id}/resources/testResource/${resource.id}`,
    );
    const responseB = await request.get(
      `/api/apps/${appB.id}/resources/testResourceB/${resource.id}`,
    );

    expect(responseA).toMatchObject({ status: 404 });
    expect(responseB).toMatchObject({ status: 404 });
  });

  it('should return the resource author when fetching a single resource if it has one', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await app.createResource({
      type: 'testResource',
      data: { foo: 'foo', bar: 1 },
      UserId: user.id,
    });

    const response = await request.get(`/api/apps/${app.id}/resources/testResource/${resource.id}`);

    expect(response).toMatchObject({
      status: 200,
      data: {
        id: resource.id,
        foo: 'foo',
        bar: 1,
        $created: new Date(0).toJSON(),
        $updated: new Date(0).toJSON(),
        $author: { id: user.id, name: user.name },
      },
    });
  });
});
describe('queryResources', () => {
  it('should be able to fetch all resources of a type', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resourceA = await app.createResource({ type: 'testResource', data: { foo: 'bar' } });
    const resourceB = await app.createResource({ type: 'testResource', data: { foo: 'baz' } });
    await app.createResource({ type: 'testResourceB', data: { bar: 'baz' } });

    const response = await request.get(`/api/apps/${app.id}/resources/testResource`);

    expect(response).toMatchObject({
      status: 200,
      data: [
        {
          id: resourceA.id,
          foo: 'bar',
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
        {
          id: resourceB.id,
          foo: 'baz',
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
      ],
    });
  });

  it('should be able to limit the amount of resources', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resourceA = await app.createResource({ type: 'testResource', data: { foo: 'bar' } });
    await app.createResource({ type: 'testResource', data: { foo: 'baz' } });

    const response = await request.get(`/api/apps/${app.id}/resources/testResource?$top=1`);

    expect(response).toMatchObject({
      status: 200,
      data: [
        {
          id: resourceA.id,
          foo: 'bar',
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
      ],
    });
  });

  it('should be able to sort fetched resources', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resourceA = await app.createResource({ type: 'testResource', data: { foo: 'bar' } });
    clock.tick(20e3);
    const resourceB = await app.createResource({ type: 'testResource', data: { foo: 'baz' } });

    const responseA = await request.get(
      `/api/apps/${app.id}/resources/testResource?$orderby=foo asc`,
    );
    const responseB = await request.get(
      `/api/apps/${app.id}/resources/testResource?$orderby=foo desc`,
    );
    const responseC = await request.get(
      `/api/apps/${app.id}/resources/testResource?$orderby=$created asc`,
    );
    const responseD = await request.get(
      `/api/apps/${app.id}/resources/testResource?$orderby=$created desc`,
    );

    expect(responseA).toMatchObject({
      status: 200,
      data: [
        {
          id: resourceA.id,
          foo: 'bar',
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
        {
          id: resourceB.id,
          foo: 'baz',
          $created: new Date(clock.now).toJSON(),
          $updated: new Date(clock.now).toJSON(),
        },
      ],
    });
    expect(responseB).toMatchObject({
      status: 200,
      data: [
        {
          id: resourceB.id,
          foo: 'baz',
          $created: new Date(clock.now).toJSON(),
          $updated: new Date(clock.now).toJSON(),
        },
        {
          id: resourceA.id,
          foo: 'bar',
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
      ],
    });
    expect(responseC).toMatchObject({ status: 200, data: responseA.data });
    expect(responseD).toMatchObject({ status: 200, data: responseB.data });
  });

  it('should be able to select fields when fetching resources', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resource = await app.createResource({ type: 'testResource', data: { foo: 'bar' } });
    const response = await request.get(`/api/apps/${app.id}/resources/testResource?$select=id`);

    expect(response).toMatchObject({
      status: 200,
      data: [{ id: resource.id }],
    });
  });

  it('should be able to filter fields when fetching resources', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await app.createResource({ type: 'testResource', data: { foo: 'foo' } });
    await app.createResource({ type: 'testResource', data: { foo: 'bar' } });

    const response = await request.get(
      `/api/apps/${app.id}/resources/testResource?$filter=foo eq 'foo'`,
    );

    expect(response).toMatchObject({
      status: 200,
      data: [
        {
          id: resource.id,
          ...resource.data,
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
      ],
    });
  });

  it('should be able to filter multiple fields when fetching resources', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await app.createResource({
      type: 'testResource',
      data: { foo: 'foo', bar: 1 },
    });
    await app.createResource({ type: 'testResource', data: { foo: 'bar', bar: 2 } });

    const response = await request.get(
      `/api/apps/${app.id}/resources/testResource?$filter=substringof('oo', foo) and id le ${resource.id}`,
    );

    expect(response).toMatchObject({
      status: 200,
      data: [
        {
          id: resource.id,
          ...resource.data,
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
      ],
    });
  });

  it('should be able to combine multiple functions when fetching resources', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await app.createResource({
      type: 'testResource',
      data: { foo: 'foo', bar: 1 },
    });
    clock.tick(20e3);
    const resourceB = await app.createResource({
      type: 'testResource',
      data: { foo: 'bar', bar: 2 },
    });

    const response = await request.get(
      `/api/apps/${app.id}/resources/testResource?$filter=substringof('oo', foo) or foo eq 'bar'&$orderby=$updated desc&$select=id,$created,$updated`,
    );

    expect(response).toMatchObject({
      status: 200,
      data: [
        {
          id: resourceB.id,
          $created: new Date(clock.now).toJSON(),
          $updated: new Date(clock.now).toJSON(),
        },
        {
          id: resource.id,
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
        },
      ],
    });
  });

  it('should return the resource author if it has one', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await app.createResource({
      type: 'testResource',
      data: { foo: 'foo', bar: 1 },
      UserId: user.id,
    });

    const response = await request.get(`/api/apps/${app.id}/resources/testResource`);

    expect(response).toMatchObject({
      status: 200,
      data: [
        {
          id: resource.id,
          foo: 'foo',
          bar: 1,
          $created: new Date(0).toJSON(),
          $updated: new Date(0).toJSON(),
          $author: { id: user.id, name: user.name },
        },
      ],
    });
  });
});

describe('createResource', () => {
  it('should be able to create a new resource', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resource = { foo: 'bar' };
    const response = await request.post(`/api/apps/${app.id}/resources/testResource`, resource);

    expect(response).toMatchObject({
      status: 201,
      data: {
        foo: 'bar',
        id: expect.any(Number),
      },
    });
  });

  it('should validate resources', async () => {
    const app = await App.create(exampleApp(organizationId));

    const resource = {};
    const response = await request.post(`/api/apps/${app.id}/resources/testResource`, resource);

    expect(response).toMatchObject({
      status: 400,
      data: {
        data: {
          foo: {
            required: true,
          },
        },
      },
    });
  });

  it('should check if an app has a specific resource definition', async () => {
    const app = await App.create(exampleApp(organizationId));

    const response = await request.get(`/api/apps/${app.id}/resources/thisDoesNotExist`);
    expect(response).toMatchObject({
      status: 404,
      data: { message: 'App does not have resources called thisDoesNotExist' },
    });
  });

  it('should check if an app has any resource definitions', async () => {
    const app = await App.create({
      definition: { name: 'Test App', defaultPage: 'Test Page' },
      path: 'test-app',
      vapidPublicKey: 'a',
      vapidPrivateKey: 'b',
      OrganizationId: organizationId,
    });
    const response = await request.get(`/api/apps/${app.id}/resources/thisDoesNotExist`);

    expect(response).toMatchObject({
      status: 404,
      data: { message: 'App does not have any resources defined' },
    });
  });
});

describe('updateResource', () => {
  it('should be able to update an existing resource', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    clock.tick(20e3);

    const response = await request.put(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
      { foo: 'I am not Foo.' },
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({
      status: 200,
      data: {
        foo: 'I am not Foo.',
        id: resource.id,
        $created: '1970-01-01T00:00:00.000Z',
        $updated: '1970-01-01T00:00:20.000Z',
      },
    });

    const responseB = await request.get(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
    );

    expect(responseB).toMatchObject({
      status: 200,
      data: {
        foo: 'I am not Foo.',
        id: resource.id,
      },
    });
  });

  it('should not be possible to update an existing resource through another resource', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    const response = await request.put(
      `/api/apps/${app.id}/resources/testResourceB/${resource.id}`,
      { foo: 'I am not Foo.' },
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({ status: 404 });
  });

  it('should not be possible to update an existing resource through another app', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    const appB = await App.create({ ...exampleApp(organizationId), path: 'app-b' });

    const response = await request.put(
      `/api/apps/${appB.id}/resources/testResource/${resource.id}`,
      { foo: 'I am not Foo.' },
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({ status: 404 });
  });

  it('should not be possible to update a non-existent resource', async () => {
    const app = await App.create(exampleApp(organizationId));
    const response = await request.put(
      `/api/apps/${app.id}/resources/testResource/0`,
      { foo: 'I am not Foo.' },
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({
      status: 404,
      data: {
        error: 'Not Found',
        message: 'Resource not found',
        statusCode: 404,
      },
    });
  });

  it('should validate resources', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    const response = await request.put(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
      { bar: 123 },
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({
      status: 400,
      data: {},
    });
  });
});

describe('deleteResource', () => {
  it('should be able to delete an existing resource', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    const responseGetA = await request.get(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
    );

    expect(responseGetA).toMatchObject({
      status: 200,
      data: {
        foo: 'I am Foo.',
        id: resource.id,
      },
    });

    const response = await request.delete(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({ status: 204 });

    const responseGetB = await request.get(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
    );

    expect(responseGetB).toMatchObject({
      status: 404,
      data: {
        error: 'Not Found',
        message: 'Resource not found',
        statusCode: 404,
      },
    });
  });

  it('should not be able to delete a non-existent resource', async () => {
    const app = await App.create(exampleApp(organizationId));
    const response = await request.delete(`/api/apps/${app.id}/resources/testResource/0`, {
      headers: { authorization: token },
    });

    expect(response).toMatchObject({
      status: 404,
      data: {
        error: 'Not Found',
        message: 'Resource not found',
        statusCode: 404,
      },
    });
  });

  it('should not be possible to delete an existing resource through another resource', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    const response = await request.delete(
      `/api/apps/${app.id}/resources/testResourceB/${resource.id}`,
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({ status: 404 });

    const responseGet = await request.get(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
    );

    expect(responseGet).toMatchObject({
      status: 200,
      data: {
        foo: 'I am Foo.',
        id: resource.id,
      },
    });
  });

  it('should not be possible to delete an existing resource through another app', async () => {
    const app = await App.create(exampleApp(organizationId));
    const resource = await Resource.create({
      type: 'testResource',
      AppId: app.id,
      data: { foo: 'I am Foo.' },
    });

    const appB = await App.create({ ...exampleApp(organizationId), path: 'app-b' });
    const response = await request.delete(
      `/api/apps/${appB.id}/resources/testResource/${resource.id}`,
      { headers: { authorization: token } },
    );

    expect(response).toMatchObject({ status: 404 });

    const responseGet = await request.get(
      `/api/apps/${app.id}/resources/testResource/${resource.id}`,
    );

    expect(responseGet).toMatchObject({
      status: 200,
      data: {
        foo: 'I am Foo.',
        id: resource.id,
      },
    });
  });
});
