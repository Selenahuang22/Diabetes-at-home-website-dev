const express = require('express')
const authRouter = require("./authenticationRouter")
// create our Router object
const clinicianRouter = express.Router()

const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get("/dashboard",authRouter.isAuthenticated,  (req, res) => clinicianController.renderDashBoard(req, res))
clinicianRouter.get("/profile",authRouter.isAuthenticated, (req, res) => clinicianController.renderProfile(req, res))

clinicianRouter.get("/patientRegister",authRouter.isAuthenticated, (req, res) => clinicianController.renderPatientRegisterPage(req, res))
clinicianRouter.post("/registerPatient",authRouter.isAuthenticated, (req, res) => clinicianController.registerPatient(req, res))

clinicianRouter.get("/:patientid/viewData",authRouter.isAuthenticated, (req, res) => clinicianController.clinicianViewData(req, res))

clinicianRouter.get("/patientComments",authRouter.isAuthenticated, (req, res) => clinicianController.renderPatientComments(req, res))
clinicianRouter.get("/clinicalNotes",authRouter.isAuthenticated, (req, res) => clinicianController.renderClinicalNotes(req, res))
clinicianRouter.get("/patient/:patientId",authRouter.isAuthenticated, (req, res) => clinicianController.renderPatientProfile(req,res))
clinicianRouter.post("/patient/:patientId/submit",authRouter.isAuthenticated, (req, res) => clinicianController.modifyPatientLog(req, res))

clinicianRouter.post("/patient/:patientId/addNote",authRouter.isAuthenticated, (req, res) => clinicianController.addClinicianNote(req, res))
clinicianRouter.post("/patient/:patientId/addsupportMsg",authRouter.isAuthenticated, (req, res) => clinicianController.addSuppportMsg(req, res))

clinicianRouter.get('/editProfile',authRouter.isAuthenticated, (req, res) => clinicianController.showProfile(req, res))
clinicianRouter.post('/editProfile',authRouter.isAuthenticated, (req, res) => clinicianController.editProfile(req, res))



module.exports = clinicianRouter