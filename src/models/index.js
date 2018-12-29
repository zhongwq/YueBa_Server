const Sequelize = require('sequelize')
const config = require('../config/config')

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)

console.log('Connecting to database', config.db.options.host, '...')

var User = sequelize.import('./User.js')
var Place = sequelize.import('./Place.js')
var Event = sequelize.import('./Event.js')
var Post = sequelize.import('./Post.js')
var Participation = sequelize.define('Participation')
var Favourite = sequelize.define('Favourite')

Place.belongsTo(User, { as: 'owner' })
Event.belongsTo(User, { as: 'organizer' })
User.belongsToMany(Event, { through: Participation })
Event.belongsTo(Place, { as: 'place' })
Event.belongsToMany(User, { through: Participation })
Post.belongsTo(User, { as: 'author' })
User.belongsToMany(Post, { through: Favourite })

module.exports = {
  User: User,
  Place: Place,
  Event: Event,
  Post: Post,
  Favourite: Favourite,
  Participation: Participation,
  sequelize: sequelize,
  Sequelize: Sequelize
}
