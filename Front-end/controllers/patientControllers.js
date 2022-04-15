// connect to Mongoose model
const mongoose = require('mongoose')
const Food = mongoose.model('Food')

// get express-validator, to validate user data in forms
const expressValidator = require('express-validator')