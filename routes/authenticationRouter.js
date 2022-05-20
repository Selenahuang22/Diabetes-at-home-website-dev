const express = require('express')
const authController = require("../controllers/authenticationController")

const authRouter = express.Router()

authRouter.get("/login", (req, res) => authController.getLoginPage(req, res))
authRouter.post("/login", (req, res) => authController.directLogin(req, res))

authRouter.post("/register/clinician", (req, res) => {
    authController.signClicianUp(req, res)
})
authRouter.get("/register/clinician", (req, res) => {
    authController.getClinicianSignUpPage(req, res)
})

//****to do!! The logic should be like this, but not completed******//
//********** */
authRouter.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = authRouter