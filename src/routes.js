const authController = require('./controllers/authController')
const authControllerPolicy = require('./policies/authControllerPolicy')
const placeController = require('./controllers/placeController')
const eventController = require('./controllers/eventController')
const uploader = require('./utils/uploader')

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
  app.get('/getAllValidPlaces',
    placeController.getAllPlaces)
  app.post('/addPlace',
    uploader.placeImg.single('image'),
    placeController.addPlace)
  app.post('/updatePlace',
    uploader.placeImg.single('image'),
    placeController.updatePlace)
  app.post('/deletePlace',
    placeController.deletePlace)
  app.post('/getAllOwnedPlace',
    placeController.getOwnedPlace)
  /***
   * Event Part
   */
  app.post('/addEvent',
    uploader.eventImg.single('image'),
    eventController.addEvent)
  app.post('/updateEvent',
    uploader.eventImg.single('image'),
    eventController.updateEvent)
  app.post('/deleteEvent',
    eventController.deleteEvent)
  app.get('/getAllEvents',
    eventController.getAllEvents)
  app.post('/getAllOwnedEvents',
    eventController.getAllOwnedEvents)
  app.post('/getParticipateEvents',
    eventController.getAllEventsParticipatesIn)
  app.post('/participate',
    eventController.participateEvent)
  app.post('/exitEvent',
    eventController.exitEvent)
}
