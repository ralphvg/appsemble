import normalize from '@appsemble/utils/normalize';
import { SchemaValidationError } from '@appsemble/utils/validate';
import validateStyle, { StyleValidationError } from '@appsemble/utils/validateStyle';
import Boom from 'boom';
import { isEqual, uniqWith } from 'lodash';
import getRawBody from 'raw-body';
import { Op, UniqueConstraintError } from 'sequelize';
import sharp from 'sharp';

import getDefaultIcon from '../utils/getDefaultIcon';
import getAppBlocks from '../utils/getAppBlocks';

async function checkBlocks(app, db) {
  const blocks = getAppBlocks(app);
  const blockVersions = await db.models.BlockVersion.findAll({
    attributes: ['name', 'version'],
    raw: true,
    where: {
      [Op.or]: uniqWith(
        Object.values(blocks).map(({ type, version }) => ({
          name: type.startsWith('@') ? type : `@appsemble/${type}`,
          version,
        })),
        isEqual,
      ),
    },
  });
  const blockVersionMap = blockVersions.reduce((acc, { name: blockName, version }) => {
    if (!Object.prototype.hasOwnProperty.call(acc, blockName)) {
      acc[blockName] = new Set();
    }
    acc[blockName].add(version);
    return acc;
  }, {});
  const errors = Object.entries(blocks).reduce((acc, [loc, { type, version }]) => {
    const fullType = type.startsWith('@') ? type : `@appsemble/${type}`;
    if (!(blockVersionMap[fullType] && blockVersionMap[fullType].has(version))) {
      return { ...acc, [loc]: `Unknown block version “${fullType}@${version}”` };
    }
    return acc;
  }, null);
  if (errors) {
    throw Boom.badRequest('Unknown blocks or block versions found', errors);
  }
}

function handleAppValidationError(error, app) {
  if (error instanceof UniqueConstraintError) {
    throw Boom.conflict(`Another app with path “${app.path}” already exists`);
  }

  if (error instanceof SyntaxError) {
    throw Boom.badRequest('App recipe must be valid JSON.');
  }

  if (error instanceof SchemaValidationError) {
    throw Boom.badRequest('App recipe is invalid.', error.data);
  }

  if (error instanceof StyleValidationError) {
    throw Boom.badRequest('Provided CSS was invalid.');
  }

  if (error.message === 'Expected file ´style´ to be css') {
    throw Boom.badRequest(error.message);
  }

  if (error.message === 'Expected file ´sharedStyle´ to be css') {
    throw Boom.badRequest(error.message);
  }

  if (Array.isArray(error)) {
    throw Boom.badRequest('Schema validation failed');
  }

  throw error;
}

export async function createApp(ctx) {
  const { db } = ctx;
  const { App } = db.models;
  const { user } = ctx.state;
  const { app, organizationId, style, sharedStyle } = ctx.request.body;

  let result;

  try {
    result = {
      definition: app,
      OrganizationId: organizationId,
      style: validateStyle(style),
      sharedStyle: validateStyle(sharedStyle),
      path: app.path || normalize(app.name),
    };

    if (!user.organizations.some(organization => organization.id === organizationId)) {
      throw Boom.forbidden('User does not belong in this organization.');
    }

    await checkBlocks(app, db);

    const { id } = await App.create(result, { raw: true });

    ctx.body = { ...result.definition, id, path: result.path };
    ctx.status = 201;
  } catch (error) {
    handleAppValidationError(error, result);
  }
}

export async function getAppById(ctx) {
  const { id } = ctx.params;
  const { App } = ctx.db.models;

  const app = await App.findByPk(id, { raw: true });

  if (!app) {
    throw Boom.notFound('App not found');
  }

  ctx.body = {
    ...app.definition,
    id,
    path: app.path,
    organizationId: app.OrganizationId,
  };
}

export async function queryApps(ctx) {
  const { App } = ctx.db.models;

  const apps = await App.findAll({ raw: true });
  ctx.body = apps.map(app => ({
    ...app.definition,
    id: app.id,
    path: app.path,
  }));
}

export async function queryMyApps(ctx) {
  const { App } = ctx.db.models;
  const {
    user: { organizations },
  } = ctx.state;

  const apps = await App.findAll({
    where: { OrganizationId: { [Op.in]: organizations.map(o => o.id) } },
  });

  ctx.body = apps.map(app => ({
    ...app.definition,
    id: app.id,
    path: app.path,
  }));
}

export async function updateApp(ctx) {
  const { db } = ctx;
  const { id } = ctx.params;
  const {
    user: { organizations },
  } = ctx.state;
  const { App } = db.models;
  const { app: definition, organizationId, style, sharedStyle } = ctx.request.body;

  let result;

  try {
    result = {
      definition,
      OrganizationId: organizationId,
      style: validateStyle(style && style.contents),
      sharedStyle: validateStyle(sharedStyle && sharedStyle.contents),
      path: definition.path || normalize(definition.name),
    };

    await checkBlocks(result.definition, db);

    const app = await App.findOne({ where: { id } });

    if (!app) {
      throw Boom.notFound('App not found');
    }

    if (!organizations.some(organization => organization.id === app.OrganizationId)) {
      throw Boom.forbidden("User does not belong in this App's organization.");
    }

    await app.update(result, { where: { id } });

    ctx.body = { ...result.definition, id, path: result.path };
  } catch (error) {
    handleAppValidationError(error, result);
  }
}

export async function getAppIcon(ctx) {
  const { id } = ctx.params;
  const { App } = ctx.db.models;
  const app = await App.findByPk(id, { raw: true });

  if (!app) {
    throw Boom.notFound('App not found');
  }

  const icon = app.icon || getDefaultIcon();
  const metadata = await sharp(icon).metadata();

  ctx.body = icon;
  // Type svg resolves to text/xml instead of image/svg+xml.
  ctx.type = metadata.format === 'svg' ? 'image/svg+xml' : metadata.format;
}

export async function setAppIcon(ctx) {
  const { id } = ctx.params;
  const { App } = ctx.db.models;
  const {
    user: { organizations },
  } = ctx.state;
  // XXX
  const icon = await getRawBody(ctx.req);

  const app = await App.findOne({ where: { id } });

  if (!app) {
    throw Boom.notFound('App not found');
  }

  if (!organizations.some(organization => organization.id === app.OrganizationId)) {
    throw Boom.forbidden("User does not belong in this App's organization.");
  }

  await app.update({ icon });
  ctx.status = 204;
}

export async function deleteAppIcon(ctx) {
  const { id } = ctx.params;
  const { App } = ctx.db.models;
  const {
    user: { organizations },
  } = ctx.state;

  const app = await App.findOne({ where: { id } });

  if (!app) {
    throw Boom.notFound('App not found');
  }

  if (!organizations.some(organization => organization.id === app.OrganizationId)) {
    throw Boom.forbidden("User does not belong in this App's organization.");
  }

  await app.update({ icon: null });

  ctx.status = 204;
}

export async function getAppCoreStyle(ctx) {
  const { id } = ctx.params;
  const { App } = ctx.db.models;

  const app = await App.findByPk(id, { raw: true });

  if (!app) {
    throw Boom.notFound('App not found');
  }

  ctx.body = app.style || '';
  ctx.type = 'css';
  ctx.status = 200;
}

export async function getAppSharedStyle(ctx) {
  const { id } = ctx.params;
  const { App } = ctx.db.models;

  const app = await App.findByPk(id, { raw: true });

  if (!app) {
    throw Boom.notFound('App not found');
  }

  ctx.body = app.sharedStyle || '';
  ctx.type = 'css';
  ctx.status = 200;
}

export async function getAppBlockStyle(ctx) {
  const { appId, organizationName, blockName } = ctx.params;
  const { AppBlockStyle } = ctx.db.models;

  const blockId = `${organizationName}/${blockName}`;
  const blockStyle = await AppBlockStyle.findOne({
    where: {
      AppId: appId,
      BlockDefinitionId: blockId,
    },
  });

  ctx.body = blockStyle && blockStyle.style ? blockStyle.style : '';
  ctx.type = 'css';
  ctx.status = 200;
}

export async function setAppBlockStyle(ctx) {
  const { appId, organizationName, blockName } = ctx.params;
  const { db } = ctx;
  const { App, AppBlockStyle, BlockDefinition } = db.models;
  const { style } = ctx.request.body;
  const css = style.toString().trim();

  const blockId = `${organizationName}/${blockName}`;

  try {
    validateStyle(css);

    const app = await App.findByPk(appId);
    if (!app) {
      throw Boom.notFound('App not found.');
    }

    const block = await BlockDefinition.findByPk(blockId);
    if (!block) {
      throw Boom.notFound('Block not found.');
    }

    await AppBlockStyle.upsert({
      style: css.length ? css.toString() : null,
      AppId: app.id,
      BlockDefinitionId: block.id,
    });

    ctx.status = 204;
  } catch (e) {
    if (e instanceof StyleValidationError) {
      throw Boom.badRequest('Provided CSS was invalid.');
    }

    throw e;
  }
}
