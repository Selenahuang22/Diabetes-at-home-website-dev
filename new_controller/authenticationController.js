const clinicianController = require("../new_controller/clinicianController")
const patientController = require("../new_controller/patientController")

const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
require('dotenv').config();

const SALT_ROUND = 10

const generateHash = async (argv, cb) => {
    bcrypt.genSalt(SALT_ROUND, function(err, salt) {
        bcrypt.hash(argv.password, salt, async function(err, hash) {
            // Store hash in your password DB.
            if(err){
                console.log(err);
                return
            }
            await cb(argv, hash)
        });
    });
}

const checkHash = async (password, hash, cb) => {
    bcrypt.compare(password, hash, async (err, valid) => {
        await cb(err, valid)
    })
}


const logIn = async (req, res) => {
    // depend on the type of userId, redirect correspondingly
    let credential = {
        userName: req.body.userid,
        password : req.body.password
    }
    if((credential.userName).includes('@')){
        credential = {email: req.body.userid, password: req.body.password}
    }
    req.body = credential
    // check if the user loging in is a Clinician
    let user = await clinicianController.retrieveClinician(credential)
    if(user){
        return checkHash(credential.password, user.password, (err, valid) =>{
            if(err || !valid){
                return res.render("B_login")
            }
            clinicianController.getClinicianHomePage(req, res)
        }) 
    }
    user = await patientController.retrievePatient(credential)
    // after obtain the user
    if(user){
        return checkHash(credential.password, user.password, (err, valid) =>{
            if(err || !valid){
                return res.render("B_login")
            }
            patientController.getPatientHomePage(req, res)
        })
    }
}

const getClinicianSignUpPage = async (req, res) => {
    res.render("clinicianSignUp")
} 

const signClinicianUp = async (req, res) => {
    let {user_name, email, password} = req.body

    if(validate(user_name, email, password)){
        generateHash(req.body, clinicianController.createNewClinician)
    }else{
        return res.render("B_login")
    }

}


const validate =  async (userName, password, email) => {
    // check if all of the item are valid according to our conffig
    for(letter of process.env.INVALID_CHARACTER){
        if(userName.includes(letter)){
            return false
        }
    }

    // check if userName is unique
    if(! await patientController.checkUniqueUserName(userName) ||
        ! await clinicianController.checkUniqueUserName(userName)){
        return false
    }

    // let just assume email is valid, normmally will have to send a validation token to the email
    // then follow that link to verify email, but in this case, it is outside the scope of this project.

    if(password.length < 8){
        return false
    }
    
    let foundNumber = false
    let foundLowerCase = false
    let foundUpperCase = false

    for(letter of password){
        if(!Number.isNaN(letter)){
            foundNumber = true 
        }

        if(letter === letter.toUpperCase()){
            foundUpperCase = true 
        }

        if(letter === letter.toLowerCase()){
            foundLowerCase = true 
        }

    }
    return foundNumber && foundLowerCase && foundUpperCase
}


module.exports = {logIn, getClinicianSignUpPage, signClinicianUp}