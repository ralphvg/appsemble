export default (sequelize, DataTypes) => {
  const OrganizationBlockStyle = sequelize.define(
    'OrganizationBlockStyle',
    {
      OrganizationId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: { model: 'Organization' },
      },
      BlockDefinitionId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: { model: 'BlockDefinition' },
      },
      style: { type: DataTypes.TEXT('long') },
    },
    {
      freezeTableName: true,
      paranoid: true,
      createdAt: 'created',
      updatedAt: 'updated',
      deletedAt: 'deleted',
    },
  );

  OrganizationBlockStyle.associate = ({ Organization, BlockDefinition }) => {
    OrganizationBlockStyle.belongsTo(Organization, { foreignKey: 'OrganizationId' });
    OrganizationBlockStyle.belongsTo(BlockDefinition, { foreignKey: 'BlockDefinitionId' });
  };

  return OrganizationBlockStyle;
};
