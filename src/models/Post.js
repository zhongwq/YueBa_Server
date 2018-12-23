/**
 * Created by zhongwq on 2018/12/17.
 */
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    content: { type: DataTypes.STRING, allowNull: false },
    img: DataTypes.STRING
  })

  return Post
}
