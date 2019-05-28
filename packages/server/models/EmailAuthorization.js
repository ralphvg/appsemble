export default (sequelize, DataTypes) => {
  const EmailAuthorization = sequelize.define(
    'EmailAuthorization',
    {
      email: { type: DataTypes.STRING, primaryKey: true },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
      key: DataTypes.STRING,
    },
    {
      freezeTableName: true,
      paranoid: true,
      createdAt: 'created',
      updatedAt: 'updated',
      deletedAt: 'deleted',
    },
  );

  EmailAuthorization.associate = ({ User, ResetPasswordToken }) => {
    EmailAuthorization.belongsTo(User);
    EmailAuthorization.hasMany(ResetPasswordToken, {
      foreignKey: { allowNull: false },
      onDelete: 'CASCADE',
    });
  };

  return EmailAuthorization;
};
