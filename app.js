// Express stuff
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
var path = require('path')
app.use(express.json())  
app.use(express.urlencoded({ extended: true })) // replaces body-parser
app.use(express.static('public'))	// define where static assets live
app.use(express.static(__dirname + '/images')); // static images

// Handlebars stuff
const exphbs = require('express-handlebars')
app.engine('hbs', exphbs.engine({
	defaultlayout: 'main',
	extname: 'hbs'
}))
app.set('view engine', 'hbs')

app.get('/', async (req, res) => {
    res.render('aboutWeb.hbs');
})

app.get('/diabetesInfo.hbs', async (req, res) => {
    res.render('diabetesInfo.hbs');
})

app.get('/aboutWeb.hbs', async (req, res) => {
    res.render('aboutWeb.hbs');
})

// connect to database
require('./models/db.js') 

// connect to router
const patientRouter = require('./routes/patientRouter.js')

app.use('/clinicianDashboard', patientRouter)



//app.all('*', (req, res) => {  // 'default' route to catch user errors
	//res.status(404).render('error', {errorCode: '404', message: 'That route is invalid.'})
//})


// start server and listen for HTTP requests
app.listen(port, () => {
  console.log("Listening ...")
})
