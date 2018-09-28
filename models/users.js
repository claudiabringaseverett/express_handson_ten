const bcrypt = require("bcryptjs");
'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define(
    'users', {
      UserId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      Email: {
        type: DataTypes.STRING,
        unique: true
      },
      Username: {
        type: DataTypes.STRING,
        unique: true
      },
      Password: DataTypes.STRING,
      Admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      Deleted: DataTypes.BOOLEAN
    }, {}
  );
  users.associate = function (models) {
    users.hasMany(models.posts, {
      foreignKey: 'UserId'
    })
  };
  users.prototype.comparePassword = function (plainTextPassword) {
    let user = this;
    return bcrypt.compareSync(plainTextPassword, user.Password)
  };

  return users;
};