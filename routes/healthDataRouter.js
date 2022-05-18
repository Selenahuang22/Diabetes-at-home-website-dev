const express = require('express')

// create our Router object
const healthDataRouter = express.Router()
const healthDataController = require("../controllers/_healthDataController")

healthDataRouter.all('/record', (req, res) => healthDataController.insertAndRender(req, res)) 

module.exports = healthDataRouter