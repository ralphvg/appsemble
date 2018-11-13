import Sequelize from 'sequelize';

function importModels(db) {
  db.import('../models/App');
  db.import('../models/Snapshot');
  db.import('../models/User');
  db.import('../models/Organization');
  db.import('../models/EmailAuthorization');
  db.import('../models/OAuthAuthorization');
  db.import('../models/OAuthClient');
  db.import('../models/Resource');
  db.import('../models/Asset');
  db.import('../models/Block');
  db.import('../models/BlockVersion');
}

function associateModels(models) {
  const {
    App,
    Snapshot,
    User,
    Organization,
    EmailAuthorization,
    OAuthAuthorization,
    Resource,
    Block,
    BlockVersion,
  } = models;

  // Model relationships
  User.belongsToMany(Organization, { through: 'UserOrganization' });
  User.hasMany(OAuthAuthorization);
  User.hasOne(EmailAuthorization);

  EmailAuthorization.belongsTo(User);

  Organization.hasOne(Organization);

  Snapshot.belongsTo(App, { foreignKey: { allowNull: false } });

  App.hasMany(Snapshot);
  App.hasMany(Resource);

  Resource.belongsTo(User);
  Resource.belongsTo(App);

  Block.hasMany(BlockVersion);
  BlockVersion.belongsTo(Block, { foreignKey: { allowNull: false } });
}

export default async function setupModels({
  dialect = 'mysql',
  sync = true,
  force = false,
  logging = false,
  host = process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost',
  port,
  username,
  password,
  database,
  uri,
}) {
  const options = {
    logging,
    // XXX: This removes a pesky sequelize warning. Remove this when updating to sequelize@^5.
    operatorsAliases: Sequelize.Op.Aliases,
  };
  let args;
  if (uri) {
    args = [uri, options];
  } else {
    args = [
      Object.assign(options, {
        dialect,
        host,
        port,
        username,
        password,
        database,
      }),
    ];
  }
  const db = new Sequelize(...args);
  importModels(db);
  associateModels(db.models);

  if (sync) {
    await db.sync({ force });
  }

  return db;
}
