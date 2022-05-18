require("../models/db")
const Clinician = require("../models/clinician")
const patientController = require("../new_controller/patientController")

/**
 * find 1 clinician document in the mongo db
 * @param {JSON} data that have at least 1 keys that is correct - which will be use to find the document
 * @returns either the Document|false
 */
const retrieveClinician = async (data) => {
    // depend on what is in the data(req.body)m we use that to find document
    const {id,  userName, email} = data 
    
    // order of retrieval: id < user_name <  email
    try {
        if( id ){
            return await Clinician.findById(id)
        
        // retrieve document using userName
        }else if(userName){
            return await Clinician.findOne({
                user_name: userName
            })
        
        // retrieve document using email
        }else if(email){
            return await Clinician.findOne({
                email: email
            })
        }

        // no keys value are passed in the body
        else{
            console.log("Get request without the Keys for documentation retrieval [Clinician]");
        }
    } catch(err){
        console.log(err);
        // this will be substitute by our error page
    }
    return false
}

const getClinicianHomePage = async(req, res) => {
    let detail = retrieveClinician(req.body)

    if(detail){
        // retrieve all client of this clinician
        let clients = await patientController.retrieveClinicianClients(detail.email)
        
        return res.render("clinicianHome", 
            {
                patient: clients
            })
    }
    else{
        res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.'})
    }
}


const createNewClinician = async (data, newPass) => {
    let clinician = new Clinician(
        data
    )
    clinician.password = newPass

    try{
        await clinician.save()
    }catch(err){
        console.log(err);
    }
    return 
}


const checkUniqueUserName = async (userName) => {
    return await Clinician.exists({user_name: userName}) == null
}

module.exports = {retrieveClinician , checkUniqueUserName, createNewClinician, getClinicianHomePage}