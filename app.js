// Express stuff
const express = require('express')
const app = express()
app.use(express.json())  
app.use(express.urlencoded({ extended: false }))
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

/* 2 static pages */
app.get('/', async (req, res) => {
    res.render('aboutWeb.hbs');
})
app.get('/diabetesInfo', async (req, res) => {
    res.render('diabetesInfo.hbs');
})

/*hard code pages now */
app.get('/login', async (req, res) => {
    res.render('login.hbs');
})

app.get('/clinicianSignUp', async (req, res) => {
    res.render('clinicianSignUp.hbs');
})

app.get('/clinicianProfile', async (req, res) => {
    res.render('clinicianProfile.hbs');
})

app.get('/editProfile', async (req, res) => {
    res.render('editProfile.hbs');
})

/*d2*/
app.use('/patient/', patientRouter)
app.use("/clinician/", clinicianRouter)
app.use('/health_data/', healthDataRouter)

/*all others pages*/
app.all('*', (req, res) => {  // 'default' route to catch user errors
	res.status(404).render('error', {errorCode: '404', message: 'That route is invalid.'})
})


// start server and listen for HTTP requests
app.listen(port, () => {
  console.log("Listening ...")
})
