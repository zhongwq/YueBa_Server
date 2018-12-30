/**
 * Created by zhongwq on 2018/12/30.
 */
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: { type: DataTypes.STRING, allowNull: false }
  })

  return Comment
}
