const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/patientController.js')
const healthDataController = require('../controllers/healthDataController.js')


patientRouter.get(
    '/:id/home',
    async (req, res) => {
        await patientController.getOnePatient(req.params.id)
        var result = await patientController.getOnePatient(req.params.id)

        console.log(result.data);
        if(result.status)
            res.render('patientHome', {
                "id": req.params.id,
                "thispatient": result.data,
                'time': new Date().toLocaleDateString()
            })
        else res.status(404).render('error', {errorCode: '404', message: 'Patient Does Not exist.'})
        
    }
)

patientRouter.get(
    '/:id/record',
    async (req, res) => {
        // check if the log cache need to be clear (expired)
        let checkResult = await patientController.checkCacheLog(req.params.id)
        
        // determin the time series that are not log for today
        let logged = []
        if(checkResult.data) {
            for(var i of checkResult.data.latest_log){
                logged.push(i.name)
                console.log(i.name);
            }
            
            res.render('dataEnter', {
                id: req.params.id, 
                log_glucose: (!logged.includes("blood glucose level"))
            })
        } else{
            res.status(404).render('error', {errorCode: '404', message: 'Patient Does Not exist.'})
        }
    }
)


patientRouter.post(
    '/:id/submit_log',
    async (req, res) => {
        // we need to check for cache expiration again
        let checkResult = await patientController.getOnePatient(req.params.id)
        let directPath = '/patient/'+req.params.id+'/home'
        let result = false
        // we can perform data interity check here

        // cache the log value
        if(req.body.value != "" && req.body.date != ""){
            // ensure the log is not exit in the cache
            if(! checkResult.data.latest_log.includes(req.body.data_name)){
                console.log(req.body);
                result = await patientController.cacheTheLog(req.body.data_name, req.body.value, checkResult.data);
            
                // if the caching successfull we can add the data to db
                if(result.status) {
                    result = await healthDataController.insert(req.params.id, req.body.data_name, req.body.comment, req.body.value)
                }
            }
            
        }
        (result)
            ? res.redirect(directPath)

            
            : res.status(404).render('error', {errorCode: '404', message: 'Error occur when try to send Data.'})
    }
)

// export the router
module.exports = patientRouter