module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define('Place', {
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    address: { type: DataTypes.STRING, unique: true, allowNull: false },
    detail: { type: DataTypes.STRING },
    price: { type: DataTypes.DOUBLE, defaultValue: 0 },
    available: { type: DataTypes.BOOLEAN, defaultValue: true }
  })

  return Place
}
