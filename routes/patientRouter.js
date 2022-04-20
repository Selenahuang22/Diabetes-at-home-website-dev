const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/patientController.js')

// add a route to handle the GET request for all demo data
patientRouter.get('/', (req, res) => patientController.getAllPatients(req, res))

// add a new JSON object to the database
//peopleRouter.post('/', peopleController.insertData)

// export the router
module.exports = patientRouter