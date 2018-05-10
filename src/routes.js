const authController = require('./controllers/authController')
const authControllerPolicy = require('./policies/authControllerPolicy')
const placeController = require('./controllers/placeController')
const eventController = require('./controllers/eventController')

module.exports = (app) => {
  /***
   * Auth Part
   */
  app.get('/', (req, res) => {
    res.send('index')
  })
  app.post('/register',
    authControllerPolicy.register,
    authController.register)
  app.post('/login',
    authController.login)
  /***
   * Place Part
   */
  app.post('/addPlace',
    placeController.addPlace)
  app.post('/updatePlace',
    placeController.updatePlace)
  app.post('/deletePlace',
    placeController.deletePlace)
  /***
   * Event Part
   */
  app.post('/addEvent',
    eventController.addEvent)
  app.post('/updateEvent',
    eventController.updateEvent)
  app.post('/deleteEvent',
    eventController.deleteEvent)
  app.get('/getAllEvents',
    eventController.getAllEvents)
  app.post('/getParticipateEvents',
    eventController.getAllEventsParticipantsIn)
  app.post('/participate',
    eventController.participateEvent)
  app.post('/exitEvent',
    eventController.exitEvent)
}
