import { permissions } from '@appsemble/utils';
import Boom from '@hapi/boom';

import checkRole from '../utils/checkRole';

export async function getAppMembers(ctx) {
  const { appId } = ctx.params;
  const { App, User } = ctx.db.models;

  const app = await App.findByPk(appId, { include: [User] });
  if (!app) {
    throw Boom.notFound('App not found');
  }

  ctx.body = app.Users.map(user => ({
    id: user.id,
    name: user.name,
    primaryEmail: user.primaryEmail,
    role: user.AppMember.role,
  }));
}

export async function getAppMember(ctx) {
  const { appId, memberId } = ctx.params;
  const { App, Organization, User } = ctx.db.models;

  const app = await App.findByPk(appId, {
    include: [{ model: User, where: { id: memberId }, required: false }, Organization],
  });
  if (!app) {
    throw Boom.notFound('App not found');
  }

  if (app.definition.security === undefined) {
    throw Boom.notFound('App does not have a security definition.');
  }

  const { policy, role: defaultRole } = app.definition.security.default;

  const user = await User.findByPk(memberId);

  if (!user) {
    throw Boom.notFound('User does not exist.');
  }

  const member = app.Users.find(u => u.id === memberId);
  let role = member ? member.AppMember.role : null;

  if (!member && policy === 'everyone') {
    role = defaultRole;
  }

  if (!member && policy === 'organization') {
    const isOrganizationMember = await app.Organization.hasUser(memberId);

    if (!isOrganizationMember) {
      throw Boom.notFound('User is not a member of the organization.');
    }

    role = defaultRole;
  }

  if (!member && policy === 'invite') {
    throw Boom.notFound('User is not a member of the app.');
  }

  ctx.body = {
    id: user.id,
    name: user.name,
    primaryEmail: user.primaryEmail,
    role,
  };
}

export async function setAppMember(ctx) {
  const { appId, memberId } = ctx.params;
  const { role } = ctx.request.body;
  const { App, User } = ctx.db.models;

  const app = await App.findByPk(appId, { include: [User] });
  if (!app) {
    throw Boom.notFound('App not found');
  }

  await checkRole(ctx, app.OrganizationId, permissions.EditApps);

  const user = await User.findByPk(memberId);
  if (!user) {
    throw Boom.notFound('User with this ID doesn’t exist.');
  }

  if (!Object.prototype.hasOwnProperty.call(app.definition.security.roles, role)) {
    throw Boom.badRequest(`Role ‘${role}’ is not defined.`);
  }

  const [member] = await app.getUsers({ where: { id: memberId } });

  if (member) {
    if (
      role === app.definition.security.default.role &&
      app.definition.security.default.policy !== 'invite'
    ) {
      await app.removeUser(member);
    } else {
      await member.AppMember.update({ role });
    }
  } else {
    await app.addUser(user, { through: { role } });
  }

  ctx.body = {
    id: user.id,
    name: user.name,
    primaryEmail: user.primaryEmail,
    role,
  };
}
