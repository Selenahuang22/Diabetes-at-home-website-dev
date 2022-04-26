const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/patientController.js')
const healthDataController = require('../controllers/healthDataController.js')


patientRouter.get(
    '/:id/home',
    async (req, res) => {
        let result = await patientController.getOnePatient(req.params.id)

        if(result.status){
            console.log(result.data);
            return res.render('patientHome', {"thispatient": result.data})
        } else{
            res.sendStatus(404)
        }
    }
)

patientRouter.get(
    '/:id/record',
    (req, res) => {
        res.render('dataEnter')
    }
)



// export the router
module.exports = patientRouter