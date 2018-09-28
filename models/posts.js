'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define('posts', {
    PostId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    PostBody: DataTypes.STRING,
    PostTitle: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    Deleted: DataTypes.BOOLEAN
  }, {});
  posts.associate = function (models) {
    posts.belongsTo(models.users, {
      foreignKey: 'UserId'
    });
  };
  return posts;
};