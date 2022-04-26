const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/patientController.js')
const healthDataController = require('../controllers/healthDataController.js')

// add a route to handle the GET request for all demo data
patientRouter.get('/clinician/Chris/dashboard', (req, res) => patientController.getAllPatients(req, res))
patientRouter.get('/patient/:id/home', (req, res) => patientController.getOnePatient(req, res))
patientRouter.get('/patient/:id/record', (req, res) => res.render('dataEnter'))

// add a new JSON object to the database
patientRouter.post('/patient/:id/record', (req, res) => healthDataController.insertData(req, res))

// export the router
module.exports = patientRouter