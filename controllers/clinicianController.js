const Clinician = require("../models/clinician");
const patientController = require("./patientController");

const getClinicianPatients = async (id) => {
    let clinician = await Clinician.findOne({_id: id}).lean()
    if(clinician){
        
        // to make it consistence with other method
        return {status:true, data: await patientController.getAllPatientOfClinician(clinician.email)}
    }
}

module.exports = {
    getClinicianPatients
}