const Clinician = require("../models/clinician");
const HealthData = require("../models/healthData");
const Patient = require("../models/patient");
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
    let clinician = await Clinician.findById(req.params.id).lean()    
    if(result.status){
        res.render("clinicianHome", 
            {
                patient: result.data.data, user: clinician, 
            })
    }else{
        res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
    }
}

const clinicianViewData = async (req, res) => {       
    let thisPatient = await Patient.findById(req.params.patientid).lean()   
    let clinician = await Clinician.findById(req.params.id).lean()    

    if(clinician){
        if (thisPatient) {
            let healthDatas = await HealthData.find({owner: thisPatient._id})

            
        } else {
            res.status(404).render('error', {errorCode: '404', message: 'Patient Does Not exist.'})
        }
    }else{
        res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
    }
}


const renderPatientRegisterPage = async (req, res) => {
    res.render("C_patientRegister", {id: req.params.id})
}

const registerPatient = async (req, res) => {
    let clinician = await Clinician.findById(req.params.id).lean()

    if(clinician){
        // this method will be use to add key data to the patient data.
        req.body.last_active_date = Date.now()
        req.body.clinician_email = clinician.email
        patientController.createNewPatient(req, res)
    } else {
        res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
    
    }
}


const renderPatientComments = async (req, res) => {
    let clinician = await Clinician.findById(req.params.id).lean()

    if(clinician){
        // retrieve all the comment of patient
        let patients = await Patient.find(
            {clinician_email: clinician.email}
        ).lean()
        
        let comments = []

        if(patients){
            // retrieve all patient comment that is recently
            const today = new Date()
            const tmr = new Date(today)
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            tmr.setDate(tmr.getDate() + 1)

            for(var patient of patients){
                let recentHD = await HealthData.find({
                    time: {$lte: tmr, $gte: yesterday},
                    owner: patient._id
                })
                if(recentHD != []){
                    comments = [...comments, ...recentHD]
                }
            }
        }
    }
}
module.exports = {
    getClinicianPatients,
    getClinicianPatientsAndRender,
    getOneClinicianAndRender,
    renderPatientRegisterPage,
    registerPatient,
    renderPatientComments,
    clinicianViewData
}