const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Patient = require("./models/patient")
const Clinician = require("./models/clinician")
const auth = require("./util/authenticator")

// Serialize information to be stored in session/cookie
passport.serializeUser((user, done) => {
    // Use id to serialize user
    done(undefined, user._id)
})


passport.deserializeUser(async (userId, done) => {
    let user = await Patient.findById(userId).lean()
    if(user){
        return done(undefined, user)
    }

    user = await Clinician.findById(userId).lean()
    if(user){
        return done(undefined, user)
    }

    return done(new Error('Bad User'), undefined)
})

passport.use(
    new LocalStrategy(async (username, password, done) => {
        
        let searchKey = {user_name: username}
        if(username.includes("@")){
            searchKey = {email: username}
        }
    
        let user = await Patient.findOne(searchKey).lean()
        if(user){

        }else{
            user = await Clinician.findOne(searchKey).lean()
        }
        if(user){
            return auth.checkHash(password, user.password, 
                (err, valid) => {
                    if(valid){
                        return done(undefined, user)
                    }

                    if(err){
                        return done(undefined, false, {
                            message: 'Error occur, please try again',
                        })
                    }

                    return done(undefined, false, {
                        message: 'Incorrect username/password',
                    })
                }

            )
        }

        return done(undefined, false, {
            message: 'Incorrect username/password',
        })
    })
)

module.exports = passport
