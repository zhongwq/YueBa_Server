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
      var placeId = req.body.placeId
      if (!req.body.placeId) {
        var place = Place.create({
          name: req.body.placeName,
          address: req.body.address,
          detail: req.body.placeDetail,
          price: req.body.price,
          ownerId: result.id
        })
        placeId = place.id
      }
      var event = await Event.create({
        name: req.body.name,
        detail: req.body.detail,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        organizerId: result.id,
        PlaceId: placeId
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
        UserId: result.id
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
        include: [{model: User, as: 'organizer'}]
      })
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
        })
      }
      var placeId = req.body.placeId
      if (!req.body.placeId) {
        var place = Place.create({
          name: req.body.placeName,
          address: req.body.address,
          detail: req.body.placeDetail,
          price: req.body.price
        })
        placeId = place.id
      }
      await event.update({
        name: req.body.name,
        detail: req.body.detail,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        organizerId: result.id,
        PlaceId: placeId
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
      })
      res.send({events: events})
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occured when getting data!'
      })
    }
  },
  async getAllEventsParticipantsIn (req, res) {
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
        return res
      })
      res.send({
        participants: participants
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
      const token = req.body.token
      const result = jwt.verify(token, config.authServiceToken.secretKey)
      if (!result) {
        return res.status(400).send({
          error: 'The token is not valid! Please sign in and try again!'
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
  }
}
