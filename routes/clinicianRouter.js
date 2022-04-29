const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get(
    "/:id/dashboard",
    async (req, res) => {
        
        let result = await clinicianController.getClinicianPatients(req.params.id)
        

        if(result.status){

            res.render("clinicianHome", 
                {
                    patient: result.data.data
                })
        }else{
            res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
        }
    }
)

module.exports = clinicianRouter