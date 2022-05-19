const Clinician = require("../models/clinician");
const HealthData = require("../models/healthData");
const patientController = require("./patientController");

const getOneClinicianAndRender = async (req, res) => {
    let clinician = await Clinician.findById(req.params.id).lean()
    if(clinician){        
       res.render("clinicianProfile", {thisClinician: clinician, user: clinician})
    } else {
        res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
    }
}

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


const renderPatientRegisterPage = async (req, res) => {
    res.render("C_patientRegister", {id: req.params.id})
}

module.exports = {
    getClinicianPatients,
    getClinicianPatientsAndRender,
    getOneClinicianAndRender,
    signPatientUp
}