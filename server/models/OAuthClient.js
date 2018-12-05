export default (sequelize, DataTypes) =>
  sequelize.define(
    'OAuthClient',
    {
      clientId: { type: DataTypes.STRING, primaryKey: true },
      clientSecret: { type: DataTypes.STRING, primaryKey: true },
      redirectUri: { type: DataTypes.STRING, allowNull: false },
    },
    {
      freezeTableName: true,
      paranoid: true,
      createdAt: 'created',
      updatedAt: 'updated',
      deletedAt: 'deleted',
    },
  );