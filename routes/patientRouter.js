const express = require('express')

// create our Router object
const patientRouter = express.Router()
const authRouter = require("./authenticationRouter")
// require our controller
const patientController = require('../controllers/patientController.js')


// process routes by calling controller functions
patientRouter.get('/home',authRouter.isAuthenticated, (req, res) => patientController.getOnePatientAndRender(req, res))
patientRouter.get('/record',authRouter.isAuthenticated, (req, res) => patientController.onePatientRecord(req, res))
patientRouter.post('/submit_log',authRouter.isAuthenticated, (req, res) => patientController.submitLog(req, res))

patientRouter.get("/viewData",authRouter.isAuthenticated, (req, res) => patientController.patientViewData(req, res))


patientRouter.get('/editProfile',authRouter.isAuthenticated, (req, res) => patientController.showProfile(req, res))
patientRouter.post('/editProfile',authRouter.isAuthenticated, (req, res) => patientController.editProfile(req, res))

    


// export the router
module.exports = patientRouter