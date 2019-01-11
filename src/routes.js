const authController = require('./controllers/authController')
const authControllerPolicy = require('./policies/authControllerPolicy')
const placeController = require('./controllers/placeController')
const eventController = require('./controllers/eventController')
const postController = require('./controllers/postController')
const uploader = require('./utils/uploader')

module.exports = (app) => {
  /***
   * Auth Part
   */
  app.get('/', (req, res) => {
    res.send('index')
  })
  app.post('/register',
    uploader.userImg.single('image'),
    authControllerPolicy.register,
    authController.register)
  app.post('/login',
    authController.login)
  app.put('/user',
    uploader.userImg.single('image'),
    authController.updateUser)
  app.get('/usericon/:username',
    authController.getIcon)
  /***
   * Place Part
   */
  app.get('/places/valid',
    placeController.getAllPlaces)
  app.get('/places/valid/search',
    placeController.searchPlaces)
  app.get('/places/valid/hint/:text',
    placeController.getHintPlaces)
  app.post('/places',
    uploader.placeImg.single('image'),
    placeController.addPlace)
  app.put('/places/:id',
    uploader.placeImg.single('image'),
    placeController.updatePlace)
  app.delete('/place/:id',
    placeController.deletePlace)
  app.get('/places/user/:id',
    placeController.getOwnedPlace)
  app.get('/place/:id',
    placeController.getDetil)
  /***
   * Event Part
   */
  app.get('/events',
    eventController.getAllEvents)
  app.get('/events/hot',
    eventController.getHotEvents)
  app.get('/events/search',
    eventController.searchEvents)
  app.post('/events',
    uploader.eventImg.single('image'),
    eventController.addEvent)
  app.get('/event/participates/user/:id',
    eventController.getAllEventsParticipatesIn)
  app.put('/event/:id',
    uploader.eventImg.single('image'),
    eventController.updateEvent)
  app.get('/event/:id',
    eventController.getDetail)
  app.delete('/event/:id',
    eventController.deleteEvent)
  app.get('/event/user/:id',
    eventController.getAllOwnedEvents)
  app.post('/event/participate',
    eventController.participateEvent)
  app.post('/event/exit',
    eventController.exitEvent)
  /***
   * Post Part
   */
  app.get('/posts',
    postController.getAllPosts)
  app.get('/posts/user/:id',
    postController.getAllUserPosts)
  app.post('/posts',
    uploader.postImg.array('images', 9),
    postController.addPost)
  app.post('/post/favourite',
    postController.favouritePost)
  app.post('/post/unfavourite',
    postController.unfavouritePost)
  app.delete('/post/:id',
    postController.deletePost)
  app.get('/post/:id/comments',
    postController.getComments)
  app.post('/post/:id/comment',
    postController.addComment)
  app.delete('/post/comment/:commentId',
    postController.deleteComment)
}
