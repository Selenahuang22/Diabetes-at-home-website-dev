const authRouter = require("express").Router()
const authController = require("../new_controller/authenticationController")
const clinicianController = require("../new_controller/clinicianController")
const patientController = require("../new_controller/patientController")

authRouter.get("/login", async (req, res) => {
    res.render("B_login")
})

authRouter.post("/login", async(req, res) => {
    authController.logIn(req, res)
})

authRouter.get("/signUp", async (req, res) =>{
    authController.getClinicianSignUpPage(req,res)
})

authRouter.post("/register/clinician", async(req, res) => {
    console.log("push");
    authController.signClinicianUp(req, res)
})

module.exports = authRouter