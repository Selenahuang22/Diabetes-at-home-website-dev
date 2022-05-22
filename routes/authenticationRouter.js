const express = require('express')
const passport = require('passport')
const authController = require("../controllers/authenticationController")

const authRouter = express.Router()

authRouter.isAuthenticated = (req, res, next) => {
    
    
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login')
    }
    // Otherwise, proceed to next middleware function
    return next()
}

authRouter.get("/login", (req, res) => authController.getLoginPage(req, res))

authRouter.post("/login",
    passport.authenticate('local', {
        failureRedirect: '/auth/login', failureFlash: true
    }),
    (req, res) => authController.directLogin(req, res)
)

authRouter.post("/register/clinician", (req, res) => {
    authController.signClicianUp(req, res)
})
authRouter.get("/register/clinician", (req, res) => {
    authController.getClinicianSignUpPage(req, res)
})

authRouter.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = authRouter