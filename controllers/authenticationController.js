
const Patient = require("../models/patient")
const Clinician = require("../models/clinician")
const authenticator = require("../util/authenticator")
const { validationResult } = require("express-validator")
// handling login route

/**
 * Handle the login request, and base on the given userid redirect them accordingly
 * @param {packet} req that has body: {userid: email/userName, password: String}
 * @param {packet} res that will be return to user
 * @returns null
 */
const directLogin = async (req, res) => {
    
    // check if able to find document with match email/user_id

    
    // base on what kind of account, render the corresponding page.
    let user = await Clinician.findOne({user_name: req.user.user_name}).lean()
    if(user){
        return authenticator.checkHash(req.body.password, user.password, async(err, valid) => {
            if(err || !valid){
                return res.redirect("/auth/login");
            }
           
            res.redirect(`/clinician/profile`)
            
        })
    }

    user = await Patient.findOne({user_name: req.user.user_name}).lean()

    if(user){
        return authenticator.checkHash(req.body.password, user.password, async(err, valid) => {
            if(err || !valid){
                return res.redirect("/auth/login");
            }
            
            res.redirect(`/patient/home`)
        })
    }
    res.redirect("/auth/login")   
}


const signClicianUp = async (req, res) => {
    // check if the credential is valid
    
    let errors = validationResult(req)
    if(!errors.isEmpty() ){
        console.log(errors);
        return res.status(404).render('error', {errorCode: '404', message: 'Invalid input.'})
    }
    if(await Patient.findOne({user_name: req.body.user_name}).lean()
        || await Clinician.findOne({user_name: req.body.user_name}).lean()
        || await Patient.findOne({email: req.body.email}).lean()
        || await Clinician.findOne({email: req.body.email}).lean()){

        return res.status(404).render('error', {errorCode: '404', message: 'Userid exist.'})
    }
    
    // hash the password then store it
    return authenticator.generateHash(req.body, async (data, hash) => {
        data.password = hash
        let clinician = new Clinician(data)
        try{
            await clinician.save()
            res.redirect('/clinician/dashboard')
        }catch(err){
            res.status(404).render('error', {errorCode: '404', message: err}) 
        }

            
    })
    
    
}

const getLoginPage = async (req, res) => {
    res.render("B_login" , {home: "/", logIn: false, user: {first_name: "Guess"}, flash: req.flash('error')})
}

const getClinicianSignUpPage = async (req, res) => {
    res.render("clinicianSignUp", {home: "/", logIn: false, user: {first_name: "Guess"}})
}

module.exports = { directLogin, signClicianUp, getLoginPage, getClinicianSignUpPage}