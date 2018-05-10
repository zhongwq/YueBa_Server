const Sequelize = require('sequelize')
const config = require('../config/config')

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)

var User = sequelize.import('./User.js')
var Place = sequelize.import('./Place.js')
var Event = sequelize.import('./Event.js')
var Participation = sequelize.define('Participation')

Place.belongsTo(User, { as: 'owner' })
Event.belongsTo(User, { as: 'organizer' })
User.belongsToMany(Event, { through: Participation })
Event.belongsTo(Place, { as: 'place' })
Event.belongsToMany(User, { through: Participation })

module.exports = {
  User: User,
  Place: Place,
  Event: Event,
  Participation: Participation,
  sequelize: sequelize,
  Sequelize: Sequelize
}
