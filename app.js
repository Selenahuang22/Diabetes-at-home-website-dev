// Express stuff
const express = require('express')
const app = express()
app.use(express.json())  
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))	// define where static assets live
app.use(express.static(__dirname + '/images')); // static images

const flash = require('express-flash')
const session = require('express-session')

// Flash messages for failed logins, and (possibly) other success/error messages
app.use(flash())
app.use(
    session({
        // The secret used to sign session cookies (ADD ENV VAR)
        secret: process.env.SESSION_SECRET ||'keyboard cat',
        name: 'test', // The cookie name (CHANGE THIS)
        saveUninitialized: false,
        proxy: process.env.NODE_ENV === 'production', //  to work on Heroku
        resave: false,
        cookie: {
            sameSite: 'strict',
            httpOnly: true,
            secure: app.get('env') === 'production'
        },
    })
    )
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // Trust first proxy
}

const passport = require('./Passport')
app.use(passport.authenticate('session'))

const port = process.env.PORT || 3000
var path = require('path')

// Handlebars stuff
const exphbs = require('express-handlebars')
app.engine('hbs', exphbs.engine({
	defaultlayout: 'main',
	extname: 'hbs',
    helpers: {
       is_blood_glucose: x => x == "blood glucose level",
       is_insulin_take: x => x == "insulin take",
       is_weight: x => x == "weight",
       is_exercises: x => x == "exercises",
       is_bgl_in_dangRange: (x, low, high) =>( x < low || x > high),
       is_in_dangRange: x => ( x.value < x.lower || x.value > x.upper),
       is_in_dangRange_ver2: x => (x.value!="x") &&( x.value < x.lower || x.value > x.upper),
       is_require_in_dangRange: x => (x.require && ( x.value == "x" || (x.value < x.lower || x.value > x.upper)))
    }
}))
app.set('view engine', 'hbs')


// connect to database
require('./models/db.js') 

// connect to router
const patientRouter = require('./routes/patientRouter.js')
const clinicianRouter = require('./routes/clinicianRouter')
const healthDataRouter = require('./routes/healthDataRouter')
const authRouter = require("./routes/authenticationRouter")
const Patient = require('./models/patient')

/* static pages */
app.get('/', async (req, res) => {
    let home = "/"
    let user = {first_name: "Guess"}
    let logIn = false
    if(req.user){
        user = req.user
        logIn = true
        if(await Patient.findById(req.user._id).lean()){
            home = "/patient/home"
        } else{
            home = "/clinician/profile"
        }
    }
    res.render('S_aboutWeb.hbs', {home: home, user: user, logIn: logIn});
})

app.get('/diabetesInfo', async (req, res) => {
    let home = "/"
    let user = {first_name: "Guess"}
    let logIn = false
    if(req.user){
        user = req.user
        logIn = true
        if(await Patient.findById(req.user._id).lean()){
            home = "/patient/home"
        } else{
            home = "/clinician/profile"
        }
    }

    res.render('S_diabetesInfo.hbs', {home: home, user: user, logIn: logIn});
})


/*d3*/
app.use('/patient/', patientRouter)
app.use("/clinician/", clinicianRouter)
app.use('/health_data/', healthDataRouter)
app.use('/auth/', authRouter)

/*all others pages*/
app.all('*', (req, res) => {  // 'default' route to catch user errors
    let user = {first_name: "Guess"}
	res.status(404).render('error', {user: user, logIn: false, errorCode: '404', message: 'That route is invalid.'})
})

// start server and listen for HTTP requests
app.listen(port, () => {
  console.log("Listening ...")
})