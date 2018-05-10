module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    detail: { type: DataTypes.STRING },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false }
  })

  return Event
}
