
const Patient = require("../models/patient")
const Clinician = require("../models/clinician")
const authenticator = require("../util/authenticator")
// handling login route

/**
 * Handle the login request, and base on the given userid redirect them accordingly
 * @param {packet} req that has body: {userid: email/userName, password: String}
 * @param {packet} res that will be return to user
 * @returns null
 */
const directLogin = async (req, res) => {
    
    // check if able to find document with match email/user_id
    let credential = { }

    if(req.body.userid.includes("@")){
        credential.email = req.body.userid;
    }else{
        credential.user_name = req.body.userid;
    }

    // base on what kind of account, render the corresponding page.
    let user = await Clinician.findOne(credential).lean()
    if(user){
        return authenticator.checkHash(req.body.password, user.password, async(err, valid) => {
            if(err || !valid){
                res.redirect("/login");
            }
            else{
                res.redirect(`/clinician/${user._id}/dashboard`)
            }
        })
    }

    user = await Patient.findOne(credential).lean()
    if(user){
        return authenticator.checkHash(req.body.password, user.password, async(err, valid) => {
            if(err || !valid){
                res.redirect("/login");
            }
            else{
                res.redirect(`/patient/${user._id}/home`)
            }
        })
    }
    res.redirect("/login")   
}


const signClicianUp = async (req, res) => {
    // check if the credential is valid
    if(authenticator.validate(req.body.user_name, req.body.password, req.body.email)){
        
        // hash the password then store it
        return authenticator.generateHash(req.body, async (data, hash) => {
            data.password = hash
            clinician = new Clinician(data)
            try{
                await clinician.save()
            }catch(err){
                res.status(404).render('error', {errorCode: '404', message: err}) 
            }
            /**
             * @todo: this will be switch to clinician home page when the route is complete
             */
            res.redirect(`/clinician/${data._id}/dashboard`)
        })
    }
    else{
        res.status(404).render('error', {errorCode: '404', message: 'Error occur when try to send Data.'})
    } 
}

module.exports = { directLogin, signClicianUp}