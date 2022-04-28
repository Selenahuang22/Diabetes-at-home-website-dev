const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

const patientController = require('../controllers/patientController.js')
const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get(
    "/:id/dashboard",
    async (req, res) => {
        
        let result = await clinicianController.getClinicianPatients(req.params.id)
        

        if(result.status){
            for(var i of result.data.data){
                await patientController.checkCacheLog(i._id)
            }

            res.render("clinicianHome", 
                {
                    patient: result.data.data
                })
        }else{
            res.sendStatus(404)
        }
    }
)

module.exports = clinicianRouter