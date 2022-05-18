const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/_patientController.js')


// process routes by calling controller functions
patientRouter.get('/:id/home', (req, res) => patientController.getOnePatientAndRender(req, res))
patientRouter.get('/:id/record', (req, res) => patientController.onePatientRecord(req, res))
patientRouter.post('/:id/submit_log', (req, res) => patientController.submitLog(req, res))

patientRouter.get('/:id/editProfile', (req, res) => patientController.showProfile(req, res))
patientRouter.post('/:id/editProfile', (req, res) => patientController.editProfile(req, res))

    


// export the router
module.exports = patientRouter