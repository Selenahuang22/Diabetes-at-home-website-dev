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
    async (req, res) => {
        // check if the log cache need to be clear (expired)
        let checkResult = await patientController.checkCacheLog(req.params.id)
        console.log(checkResult);
        // determin the time series that are not log for today
        let logged = []
        if(checkResult.data)
            for(var i of checkResult.data.latest_log){
                logged.push(i.name)
            }

        res.render('dataEnter', {
            id: req.params.id, 
            need_log_glucose: !("blood glucose level" in logged)
        })
    }
)


patientRouter.post(
    '/:id/submit_log',
    (req, res) => {
        console.log(req.params.id);
        // check if 
    }
)

// export the router
module.exports = patientRouter