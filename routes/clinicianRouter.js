const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get("/:id/dashboard", (req, res) => clinicianController.getClinicianPatientsAndRender(req, res))
clinicianRouter.get("/:id/profile", (req, res) => clinicianController.getOneClinicianAndRender(req, res))

clinicianRouter.get("/:id/patientRegister", (req, res) => clinicianController.renderPatientRegisterPage(req, res))
clinicianRouter.post("/:id/registerPatient", (req, res) => clinicianController.registerPatient(req, res))

clinicianRouter.get("/:id/:patientid/viewData", (req, res) => clinicianController.clinicianViewData(req, res))

clinicianRouter.get("/:id/patientComments", (req, res) => clinicianController.renderPatientComments(req, res))
clinicianRouter.get("/:id/patient/:patientId", (req, res) => clinicianController.renderPatientProfile(req,res))
clinicianRouter.post("/:id/patient/:patientId/submit", (req, res) => clinicianController.modifyPatientLog(req, res))

clinicianRouter.post("/:id/patient/:patientId/addNote", (req, res) => clinicianController.addClinicianNote(req, res))
clinicianRouter.post("/:id/patient/:patientId/addsupportMsg", (req, res) => clinicianController.addSuppportMsg(req, res))

module.exports = clinicianRouter