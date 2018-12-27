const Sequelize = require('sequelize')
const config = require('../config/config')

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
)

var flag = false

while (flag === false) {
  console.log('Connecting to database...')
  sequelize.authenticate()
    .then(() => {
      flag = true
      console.log('Connection has been established successfully.')
    }).catch(err => {
      console.error('Unable to connect to the database:', err)
    })
}

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
  Participation: Participation,
  sequelize: sequelize,
  Sequelize: Sequelize
}
