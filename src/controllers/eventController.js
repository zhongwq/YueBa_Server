const { User, Event, Place, Participation } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
  async addEvent (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      const imgDefault = 'public/images/eventImage/event.jpg'
      var placeId = req.body.placeId
      var place
      if (!req.body.placeId) {
        place = Place.create({
          name: req.body.placeName,
          address: req.body.address,
          detail: req.body.placeDetail,
          price: req.body.price,
          ownerId: result.id,
          img: (req.file) ? req.file.path : imgDefault
        })
        placeId = place.id
      } else {
        place = await Place.findOne({
          where: {
            id: placeId
          }
        })
      }
      var event = await Event.create({
        name: req.body.name,
        detail: req.body.detail,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        maxNum: req.body.maxNum,
        organizerId: result.id,
        placeId: placeId,
        img: (req.file) ? req.file.path : imgDefault
      })

      await place.update({
        available: false
      })

      const eventJSON = event.toJSON()

      res.send({
        event: eventJSON
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'The ' + err.errors[0].path + ' is in use!'
      })
    }
  },
  async getSingleEvent (req, res) {
    try {
      var event = await Event.findOne({
        where: {
          id: req.body.id
        },
        include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
      })
      res.send(event.toJSON())
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occoured when getting data!'
      })
    }
  },
  async deleteEvent (req, res) {
    const token = req.body.token
    const result = jwt.verify(token, config.authServiceToken.secretKey)
    if (!result) {
      return res.status(400).send({
        error: 'The token is not valid! Please sign in and try again!'
      })
    }
    var event = await Event.findOne({
      where: {
        id: req.body.id,
        organizerId: result.id
      },
      include: [{ model: Place, as: 'place' }]
    })
    event.place.update({
      available: true
    })
    await event.destroy()
    res.send({
      info: 'Delete event successfully!'
    })
  },
  async updateEvent (req, res) {
    try {
      const event = await Event.findOne({
        where: {id: req.body.id},
        include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
      })
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      const imgDefault = 'public/images/eventImage/event.jpg'
      var placeId = req.body.placeId
      if (!req.body.placeId) {
        var place = Place.create({
          name: req.body.placeName,
          address: req.body.address,
          detail: req.body.placeDetail,
          price: req.body.price,
          ownerId: result.id,
          img: (req.file) ? req.file.path : imgDefault
        })
        placeId = place.id
      }
      if (placeId !== event.place.id) {
        event.place.update({
          available: true
        })
      }
      await event.update({
        name: req.body.name,
        detail: req.body.detail,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        maxNum: req.body.maxNum,
        organizerId: result.id,
        placeId: placeId,
        img: (req.file) ? req.file.path : event.img
      })
      res.send({
        event: event.toJSON()
      })
    } catch (err) {
      res.status.send({
        error: 'Some wrong occured when updating event!'
      })
    }
  },
  async getAllEvents (req, res) {
    try {
      var events = await Event.findAll({
        include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
      }).map(async (event) => {
        var count = await Participation.findAll({
          where: {
            EventId: event.id
          }
        })
        event = event.toJSON()
        event.participantsNum = (count.length === undefined) ? 0 : count.length
        return event
      })
      res.send({events: events})
    } catch (err) {
      console.log(err.message)
      res.status(400).send({
        error: 'Some wrong occured when getting data!'
      })
    }
  },
  async getAllOwnedEvents (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var events = await Event.findAll({
        where: {
          organizerId: result.id
        },
        include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
      }).map(async (event) => {
        var count = await Participation.findAll({
          where: {
            EventId: event.id
          }
        })
        event = event.toJSON()
        event.participantsNum = (count.length === undefined) ? 0 : count.length
        return event
      })
      res.send({events: events})
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occured when getting data!'
      })
    }
  },
  async getAllEventsParticipatesIn (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var participants = await Participation.findAll({
        where: {
          UserId: result.id
        }
      }).map(async (participant) => {
        var res = await Event.findOne({
          where: {
            id: participant.EventId
          },
          include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
        })
        var count = await Participation.findAll({
          where: {
            EventId: res.id
          }
        })
        res = res.toJSON()
        res.participantsNum = (count.length === undefined) ? 0 : count.length
        return res
      })
      res.send({
        events: participants
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'Some wrong occured when getting data!'
      })
    }
  },
  async participateEvent (req, res) {
    try {
      console.log(req.body)
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var event = await Event.findOne({
        where: {
          id: req.body.id
        }
      })
      var count = await Participation.findAll({
        where: {
          EventId: req.body.id
        }
      })
      if (count.length === event.maxNum) {
        return res.status(400).send({
          error: "The event's participants is equal to the max, you can't join in it."
        })
      }
      await Participation.create({
        UserId: result.id,
        EventId: req.body.id
      })
      res.send({
        info: 'Participate successfully!'
      })
    } catch (err) {
      console.log(err.message)
      res.status(400).send({
        error: 'Some wrong occured when participate in event!!'
      })
    }
  },
  async exitEvent (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var participant = await Participation.findOne({
        where: {
          UserId: result.id,
          EventId: req.body.id
        }
      })
      await participant.destroy()
      res.send({
        info: 'Exit the event successfully!'
      })
    } catch (err) {
      console.log(err)
      res.status(400).send({
        error: 'Some wrong occured when participate in event!!'
      })
    }
  },
  async getDetail (req, res) {
    try {
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var event = await Event.findOne({
        where: {
          id: req.body.id
        },
        include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
      })

      event = event.toJSON()

      var participators = await Participation.findAll({
        where: {
          EventId: req.body.id
        }
      }).map(async (participant) => {
        var user = await User.findOne({
          where: {
            id: participant.UserId
          }
        })
        return user.toJSON()
      })

      event.participators = participators
      var flag = false
      var editFlag = false
      if (event.organizerId === result.id) {
        flag = true
        editFlag = true
      } else {
        for (var i = 0; i < participators.length; i++) {
          if (participators[i].id === result.id) {
            flag = true
            break
          }
        }
      }
      event.flag = flag
      event.editFlag = editFlag
      res.send({
        detail: event
      })
    } catch (err) {
      console.log(err.message)
      res.status(400).send({
        error: 'Some wrong occured when participate in event!!'
      })
    }
  }
}
