const { User, Event, Place, Participation } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function top (arr, comp) {
  if (arr.length === 0) {
    return
  }
  var i = arr.length / 2 | 0
  for (; i >= 0; i--) {
    if (comp(arr[i], arr[i * 2])) {
      exch(arr, i, i * 2)
    }
    if (comp(arr[i], arr[i * 2 + 1])) {
      exch(arr, i, i * 2 + 1)
    }
  }
  return arr[0]
}

function exch (arr, i, j) {
  var t = arr[i]
  arr[i] = arr[j]
  arr[j] = t
}

function topK (arr, n, comp) {
  if (!arr || arr.length === 0 || n <= 0 || n > arr.length) {
    return -1
  }
  var ret = []
  for (var i = 0; i < n; i++) {
    var max = top(arr, comp)
    ret.push(max)
    arr.splice(0, 1)
  }
  return ret
}

module.exports = {
  async addEvent (req, res) {
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
        error: err.errors[0].message
      })
    }
  },
  async deleteEvent (req, res) {
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
    var event = await Event.findOne({
      where: {
        id: req.params.id,
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
        where: {id: req.params.id},
        include: [{model: User, as: 'organizer'}, {model: Place, as: 'place'}]
      })
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
        include: [{model: User, as: 'organizer', attributes: ['id', 'username', 'email', 'phone', 'img']}, {model: Place, as: 'place'}]
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
  async getHotEvents (req, res) {
    try {
      var events = await Event.findAll({
        include: [{model: User, as: 'organizer', attributes: ['id', 'username', 'email', 'phone', 'img']}, {model: Place, as: 'place'}]
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
      const result = topK(events, (events.length > 10) ? 5 : events.length, function (a, b) {
        if (!b) {
          return false
        }
        return a.participantsNum < b.participantsNum
      })
      res.send({result: result})
    } catch (err) {
      res.status(400).send({
        error: 'Some wrong occured when getting data!'
      })
    }
  },
  async getAllOwnedEvents (req, res) {
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
      var events = await Event.findAll({
        where: {
          organizerId: result.id
        },
        include: [{model: User, as: 'organizer', attributes: ['id', 'username', 'email', 'phone', 'img']}, {model: Place, as: 'place'}]
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
      var participants = await Participation.findAll({
        where: {
          UserId: result.id
        }
      }).map(async (participant) => {
        var res = await Event.findOne({
          where: {
            id: participant.EventId
          },
          include: [{model: User, as: 'organizer', attributes: ['id', 'username', 'email', 'phone', 'img']}, {model: Place, as: 'place'}]
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
      const token = req.header('Authorization')
      var result
      if (token) {
        result = jwt.verify(token, config.authServiceToken.secretKey)
      }
      var event = await Event.findOne({
        where: {
          id: req.params.id
        },
        include: [{model: User, as: 'organizer', attributes: ['id', 'username', 'email', 'phone', 'img']}, {model: Place, as: 'place'}]
      })

      event = event.toJSON()

      var participators = await Participation.findAll({
        where: {
          EventId: req.params.id
        }
      }).map(async (participant) => {
        var user = await User.findOne({
          where: {
            id: participant.UserId
          },
          attributes: ['id', 'username', 'email', 'phone', 'img']
        })
        return user.toJSON()
      })

      event.participators = participators
      var flag = false
      var editFlag = false
      if (result) {
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
      }
      event.flag = flag
      event.editFlag = editFlag
      res.send({
        event: event
      })
    } catch (err) {
      console.log(err.message)
      res.status(400).send({
        error: 'Some wrong occured when participate in event!!'
      })
    }
  }
}
