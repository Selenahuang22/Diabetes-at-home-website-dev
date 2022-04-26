const Patient = require("../models/patient")

/**
 * 
 * @param {String} email email of a clinician
 * @returns an array of patients manage buy this clinician
 */
const getAllPatientOfClinician = async (email) => {
    
    return {status:true, data: await Patient
        .find(
            {clinician_email: email}
        ).lean()
    }
}

/**
 * 
 * @param {String} id the string local id of the patient as in the mongo db
 * @returns JSON object with attribute as stored in the DB
 */
const getOnePatient = async (id) => {
    return { 
        status: true, 
        data: await Patient.findOne({_id: id}).lean()
    }
}

module.exports = {
    getAllPatientOfClinician,
    getOnePatient
}