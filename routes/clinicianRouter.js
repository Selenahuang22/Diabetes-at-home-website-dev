const express = require('express')

// create our Router object
const clinicianRouter = express.Router()

const clinicianController = require("../controllers/clinicianController")

clinicianRouter.get(
    "/:id/dashboard",
    async (req, res) => {
        
        let result = await clinicianController.getClinicianPatients(req.params.id)
        

        if(result.status){
            await clinicianController.checkAllPatientsCacheLog(result.data.data)

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