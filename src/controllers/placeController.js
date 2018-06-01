const {Place, User, Event} = require('../models')
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
  async getOwnedPlace (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var places = await Place.findAll({
        where: {
          ownerId: result.id
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
  async getSinglePlace (req, res) {
    try {
      var place = await Place.findOne({
        where: {
          id: req.body.id
        },
        include: [{model: User, as: 'owner'}]
      })
      res.send(place.toJSON())
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
      const imgDefault = 'public/images/placeImage/Place.jpg'
      var place = await Place.create({
        name: req.body.name,
        address: req.body.address,
        detail: req.body.detail,
        price: req.body.price,
        ownerId: result.id,
        img: (req.file) ? req.file.path : imgDefault
      })

      res.send({
        place: place.toJSON()
      })
    } catch (err) {
      console.log(err.fields[0])
      res.status(400).send({
        error: err.fields[0] + ' has been used!'
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
      if (!place.available) {
        res.status(400).send({
          error: 'The place is using, please contact the using person to change his place!'
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
  },
  async getDetil (req, res) {
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
          id: req.body.id
        },
        include: [{model: User, as: 'owner'}]
      })
      place = place.toJSON()
      var editflag = false
      if (place.ownerId === result.id) {
        editflag = true
      }
      if (place.available === false) {
        var event = await Event.findOne({
          where: {
            placeId: place.id
          }
        })
        event = event.toJSON()
        place.eventItem = event
      }
      place.editFlag = editflag

      res.send({
        detail: place
      })
    } catch (err) {
      console.log(err.message)
      res.status(400).send({
        error: 'Some error occured when deleting event!'
      })
    }
  }
}
