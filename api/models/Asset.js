export default (sequelize, DataTypes) => sequelize.define('Asset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  mime: { type: DataTypes.STRING, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  data: { type: DataTypes.BLOB, allowNull: false },
}, {
  freezeTableName: true,
  paranoid: true,
  createdAt: 'created',
  updatedAt: 'updated',
  deletedAt: 'deleted',
});