const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const config = require('./config/config')
const path = require('path')
const {sequelize} = require('./models')

const app = express()
app.use(morgan('combined'))
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json())
app.use(cors())

require('./routes')(app)

sequelize.sync()
  .then(() => {
    app.listen(process.env.PORT || config.port)
    console.log(`Server start listen on port ${config.port}`)
  })
