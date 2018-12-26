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
        include: [{model: User, as: 'owner', attributes: ['id', 'username', 'email', 'phone', 'img']}]
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
  async getHintPlaces (req, res) {
    try {
      var places = await Place.findAll({
        where: {
          available: true,
          name: {
            $like: '%' + req.params.text + '%'
          }
        },
        include: [{model: User, as: 'owner', attributes: ['id', 'username', 'email', 'phone', 'img']}]
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
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
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
        include: [{model: User, as: 'owner', attributes: ['id', 'username', 'email', 'phone', 'img']}]
      })
      res.send({
        places: places
      })
    } catch (err) {
      res.status(400).send({
        error: 'Token should be given, Please check your login state!'
      })
    }
  },
  async addPlace (req, res) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      const imgDefault = 'public/images/placeImage/Place.jpg'
      await Place.create({
        name: req.body.name,
        address: req.body.address,
        detail: req.body.detail,
        price: req.body.price,
        ownerId: result.id,
        img: (req.file) ? req.file.path : imgDefault
      })

      var place = await Place.findOne({
        where: {
          available: true,
          name: req.body.name
        },
        include: [{model: User, as: 'owner', attributes: ['id', 'username', 'email', 'phone', 'img']}]
      })

      res.send({
        place: place.toJSON()
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: err.fields !== undefined ? 'The ' + err.fields[0] + ' has been used!' : 'Error input please check your input'
      })
    }
  },
  async updatePlace (req, res) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var place = await Place.findOne({
        where: {
          id: req.params.id,
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
        error: 'The ' + err.fields[0] + ' has been used!'
      })
    }
  },
  async deletePlace (req, res) {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return res.status(400).send({
          error: 'token should be given!'
        })
      }
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var place = await Place.findOne({
        where: {
          id: req.params.id,
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
      const token = req.header('Authorization')
      var result
      if (token) {
        result = jwt.verify(token, config.authServiceToken.secretKey)
      }
      var place = await Place.findOne({
        where: {
          id: req.params.id
        },
        include: [{model: User, as: 'owner', attributes: ['id', 'username', 'email', 'phone', 'img']}]
      })
      place = place.toJSON()
      var editflag = false
      if (result) {
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
      }
      place.editFlag = editflag

      res.send({
        place: place
      })
    } catch (err) {
      res.status(400).send({
        error: 'Some error occured when deleting event!'
      })
    }
  }
}
