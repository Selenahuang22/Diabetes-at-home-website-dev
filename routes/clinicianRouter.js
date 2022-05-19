const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get("/:id/dashboard", (req, res) => clinicianController.getClinicianPatientsAndRender(req, res))
clinicianRouter.get("/:id/profile", (req, res) => clinicianController.getOneClinicianAndRender(req, res))

clinicianRouter.get("/:id/patientRegister", (req, res) => clinicianController.renderPatientRegisterPage(req, res))
clinicianRouter.post("/:id/registerPatient", (req, res) => clinicianController.registerPatient(req, res))

clinicianRouter.get("/:id/patientComment", (req, res) => {})
module.exports = clinicianRouter