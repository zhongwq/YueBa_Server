const {User, Sequelize} = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function jwtSignUser (user) {
  const ONE_WEEK = 60 * 60 * 24 * 7
  return jwt.sign(user, config.authServiceToken.secretKey, {
    expiresIn: ONE_WEEK
  })
}

module.exports = {
  async register (req, res) {
    try {
      const imgDefault = 'public/images/userImage/default.jpg'
      var user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        img: (req.file) ? req.file.path : imgDefault
      })
      const userJson = user.toJSON()
      var tmpData = user.dataValues
      delete tmpData.password
      res.send({
        user: tmpData,
        token: jwtSignUser(userJson)
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'The ' + err.errors[0].path + ' is in use!'
      })
    }
  },
  async login (req, res) {
    try {
      const {account, password} = req.body
      var user = await User.findOne({ where: {[Sequelize.Op.or]: [{email: account}, {username: account}]} })

      if (!user) {
        return res.status(400).send({
          error: "Can't find the user!"
        })
      }

      const userJson = user.toJSON()
      const isPasswordValid = await user.comparePassword(password)

      if (isPasswordValid) {
        var tmpData = user.dataValues
        delete tmpData.password
        res.send({
          user: tmpData,
          token: jwtSignUser(userJson)
        })
      } else {
        res.status(400).send({
          error: 'The password is wrong!'
        })
      }
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'Somthing wrong with the server!'
      })
    }
  },
  async getIcon (req, res) {
    try {
      var user = await User.findOne({ where: {username: req.params.username} })
      if (!user) {
        return res.status(400).send({
          error: "Can't find the user!"
        })
      }
      res.send({
        image: user.img
      })
    } catch (err) {
      res.status(400).send({
        error: 'Somthing wrong with the server!'
      })
    }
  }
}
