const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/patientController.js')

// add a route to handle the GET request for all demo data
patientRouter.get('/clinician/Chris/dashboard', (req, res) => patientController.getAllPatients(req, res))
patientRouter.get('/patient/:id/home', (req, res) => patientController.getOnePatient(req, res))

// add a new JSON object to the database
//peopleRouter.post('/', peopleController.insertData)

// export the router
module.exports = patientRouter