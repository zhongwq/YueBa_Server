const {Place, User} = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
  async getAllPlaces (req, res) {
    try {
      var places = await Place.findAll({
        where: {
          available: true
        },
        include: [{model: User, as: 'owner'}]
      })
      res.send({
        places: places
      })
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occoured when getting data!'
      })
    }
  },
  async addPlace (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      console.log(req.body)
      const imgDefault = 'public/images/SYSU.PNG'
      var place = await Place.create({
        name: req.body.name,
        address: req.body.address,
        detail: req.body.detail,
        price: req.body.price,
        ownerId: result.id,
        img: (req.file) ? req.file.path : imgDefault
      })

      console.log(place)

      res.send({
        place: place.toJSON()
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'Some wrong occoured when getting data!'
      })
    }
  },
  async updatePlace (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var place = await Place.findOne({
        where: {
          id: req.body.id,
          ownerId: result.id
        }
      })
      if (!place) {
        res.status(400).send({
          error: 'No place is found, please check your request!'
        })
      }
      await place.update({
        name: req.body.name,
        address: req.body.address,
        detail: req.body.detail,
        price: req.body.price,
        img: (req.file) ? req.file.path : place.img
      })
      res.send({
        place: place.toJSON()
      })
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occoured when getting data!'
      })
    }
  },
  async deletePlace (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var place = await Place.findOne({
        where: {
          id: req.body.id,
          ownerId: result.id
        }
      })
      if (!place) {
        res.status(400).send({
          error: 'No place is found, please check your request!'
        })
      }
      await place.destroy()
      res.send({
        info: 'Delete place successfully'
      })
    } catch (err) {
      res.status(400).send({
        error: 'Some error occured when deleting event!'
      })
    }
  }
}
