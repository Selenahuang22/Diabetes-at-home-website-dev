const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get("/:id/dashboard", (req, res) => clinicianController.getClinicianPatientsAndRender(req, res))

module.exports = clinicianRouter