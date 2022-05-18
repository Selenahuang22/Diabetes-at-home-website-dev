const Patient = require("../models/patient")
const clinicianController = require("../new_controller/clinicianController")

const retrievePatient = async (data) => {
    // depend on what in the req body, we use them to find document
    const { id, userName, email} = data;
    
    // order of retrieval: id < user_name <  email
    try {
        if( id ){
            return await Patient.findById(id)
        
        // retrieve document using userName
        }else if(userName){
            return await Patient.findOne({
                user_name: userName
            })
        
        // retrieve document using email
        }else if(email){
            return await Patient.findOne({
                email: email
            })
        }

        // no keys value are passed in the body
        else{
            console.log("Get request without the Keys for documentation retrieval [Patient]");
        }
    } catch(err){
        console.log(err);
        // this will be substitute by our error page
    }
    return false
}

const retrieveClinicianClients = async (email) => {
    return await Patient.find({clinician_email: email}).lean()
}


const getPatientHomePage = async (req, res) => {
    let detail = await retrievePatient(req.body)
    let errMsg = "Patient does not exist!"
    // if there are not enough information to retrieve the patient data, detail will be False
    if(detail){
        const clinician = await clinicianController.retrieveClinician({email: detail.clinician_email})
        
        if(clinician){
            let {first_name, last_name, email, DOB, biography, latest_log } = detail
            let {first_name: clinician_first_name, last_name: clinician_last_name} = clinician
            
            return res.render('patientHome',{
                "id": detail.id,
                "first_name": first_name,
                "last_name": last_name,
                "DOB":DOB,
                "email":email,
                "latest_log":latest_log,
                "biography":biography,
                "clinician_last_name" :clinician_first_name,
                "clinician_fist_name": clinician_last_name,
                "time": new Date().toLocaleDateString()
            })
        }else{
            errMsg = "Patient's reference the INVALID email - which does not belong to any clinician in MONGODB!"
        }
    }
    res.status(404).render('error', {errorCode: '404', message: errMsg})
}


const checkUniqueUserName = async (userName) => {
    return await Patient.exists({user_name: userName}) == null
}

module.exports = {
    retrievePatient, 
    getPatientHomePage,
    retrieveClinicianClients, 
    checkUniqueUserName
}