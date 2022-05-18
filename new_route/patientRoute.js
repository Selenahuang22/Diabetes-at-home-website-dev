const patientRouter = require("express").Router()
const patientController = require('../new_controller/patientController')

patientRouter.get('/home',
    (req, res) => patientController.getPatientHomePage(req, res)
)

module.exports = patientRouter