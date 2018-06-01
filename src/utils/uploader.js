const multer = require('multer')

const placeStorage = multer.diskStorage({
  destination: 'public/images/placeImage',
  filename: function (req, file, cb) {
    var fileformat = (file.originalname).split('.')
    cb(null, fileformat[0] + '-' + Date.now() + '.' + fileformat[fileformat.length - 1])
  }
})

const eventStorage = multer.diskStorage({
  destination: 'public/images/eventImage/',
  filename: function (req, file, cb) {
    var fileformat = (file.originalname).split('.')
    cb(null, fileformat[0] + '-' + Date.now() + '.' + fileformat[fileformat.length - 1])
  }
})

const userStorage = multer.diskStorage({
  destination: 'public/images/userImage/',
  filename: function (req, file, cb) {
    var fileformat = (file.originalname).split('.')
    cb(null, fileformat[0] + '-' + Date.now() + '.' + fileformat[fileformat.length - 1])
  }
})

module.exports = {
  placeImg: multer({
    storage: placeStorage
  }),
  eventImg: multer({
    storage: eventStorage
  }),
  userImg: multer({
    storage: userStorage
  })
}
