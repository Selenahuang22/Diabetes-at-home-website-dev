// Express stuff
const express = require('express')
const app = express()
app.use(express.json())  
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))	// define where static assets live
app.use(express.static(__dirname + '/images')); // static images

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
       is_bgl_in_dangRange: x =>( x <3.9 || x>10),
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

/* static pages */
app.get('/', async (req, res) => {
    res.render('S_aboutWeb.hbs');
})
app.get('/diabetesInfo', async (req, res) => {
    res.render('S_diabetesInfo.hbs');
})

/* hard code pages now */
/* page for both */
app.get('/login', async (req, res) => {
    res.render('B_login.hbs');
})
app.get('/editProfile', async (req, res) => {
    res.render('B_editProfile.hbs');
})
app.get('/viewData', async (req, res) => {
    res.render('B_viewData.hbs');
})

/* clician pages */
app.get('/clinicianSignUp', async (req, res) => {
    res.render('clinicianSignUp.hbs');
})
app.get('/home', async (req, res) => {
    res.render('clinicianProfile.hbs');
})
app.get('/clinicianNotes', async (req, res) => {
    res.render('clinicianNotes.hbs');
})
app.get('/patientRegister', async (req, res) => {
    res.render('C_patientRegister.hbs');
})
app.get('/patientComments', async (req, res) => {
    res.render('C_patientComments.hbs');
})
app.get('/patientProfile', async (req, res) => {
    res.render('C_patientProfile.hbs');
})


/* patient pages */




/*d2*/
app.use('/patient/', patientRouter)
app.use("/clinician/", clinicianRouter)
app.use('/health_data/', healthDataRouter)
app.use('/auth/', authRouter)
/*all others pages*/
app.all('*', (req, res) => {  // 'default' route to catch user errors
	res.status(404).render('error', {errorCode: '404', message: 'That route is invalid.'})
})

// start server and listen for HTTP requests
app.listen(port, () => {
  console.log("Listening ...")
})