const express = require('express')
const authController = require("../controllers/authenticationController")

// create our Router object
const authRouter = express.Router()

authRouter.post("/login", (req, res) => authController.directLogin(req, res))

authRouter.post("/register/clinician", (req, res) => {
    authController.signClicianUp(req, res)
})
module.exports = authRouter