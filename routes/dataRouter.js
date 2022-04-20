const express = require('express')

// create our Router object
const dataRouter = express.Router()

// require our controller
const dataController = require('../controllers/dataController.js')

// add a new JSON object to the database
dataRouter.post('/', dataController.insertData)

// add a new JSON object to the database
//peopleRouter.post('/', peopleController.insertData)

// export the router
module.exports = dataRouter