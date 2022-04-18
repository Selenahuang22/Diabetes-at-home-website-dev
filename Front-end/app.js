// Express stuff
const express = require('express')
const app = express()
var path = require('path')
//app.use(express.json())  
app.use(express.urlencoded({ extended: true })) // replaces body-parser
app.use(express.static('public'))	// define where static assets live

// Handlebars stuff
const exphbs = require('express-handlebars')
app.engine('hbs', exphbs.engine({
	defaultlayout: 'main',
	extname: 'hbs'
}))
app.set('view engine', 'hbs')

// connect to database
//require('./models/db.js') 

// connect to router
//const foodRouter = require('./routes/patientRouter.js')

// send HTTP requests to router
app.get('/', async (req, res) => {
    res.render('index.hbs');
})


//app.all('*', (req, res) => {  // 'default' route to catch user errors
	//res.status(404).render('error', {errorCode: '404', message: 'That route is invalid.'})
//})


// start server and listen for HTTP requests
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening ...")
})
