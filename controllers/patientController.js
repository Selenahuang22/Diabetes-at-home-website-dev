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

/***
 * free all the cached log if last active before today
 */
const checkCacheLog = async (id) => {
    let patient = await Patient.findOne({_id: id}).lean()

    // check if the cache is not occur today.
    let todayInUnix = extractUnixOfYYYY_MM_DD(Date.now())
    console.log(Date.now());
    if( todayInUnix != Number( patient.last_active_date)){
        patient.latest_log = [];
        patient.last_active_date = todayInUnix;
        console.log(patient);
        await patient.save();
        console.log("here");
    }

    return {
        status: true,
        data: patient.data
    }
}

const extractUnixOfYYYY_MM_DD = (unix) => {
    Math.floor(unix / 86400000) * 86400000;
}
module.exports = {
    getAllPatientOfClinician,
    getOnePatient,
    checkCacheLog
}