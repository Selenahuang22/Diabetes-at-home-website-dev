const Clinician = require("../models/clinician");
const patientController = require("./_patientController");

const getClinicianPatients = async (id) => {
    let clinician = await Clinician.findOne({_id: id}).lean()
    if(clinician){
        
        // to make it consistence with other method
        return {status:true, data: await patientController.getAllPatientOfClinician(clinician.email)}
    }
}

const getClinicianPatientsAndRender = async (req, res) => {       
    let result = await getClinicianPatients(req.params.id)
        

    if(result.status){
        res.render("clinicianHome", 
            {
                patient: result.data.data
            })
    }else{
        res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
    }
}

module.exports = {
    getClinicianPatients,
    getClinicianPatientsAndRender,
}