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

/**
 * 
 * @param {String} id the value act as key to retrieve our entry in the mong
 * @returns 
 */
const checkCacheLog = async (id) => {
    let foundPatient = await Patient.findOne({_id: id}).lean()

    // check if the cache is not occur today.
    let todayInUnix = extractUnixOfYYYY_MM_DD(Date.now())
    // we need to reset the cache log if it is expire, and update the corresponding data in our remote DB
    if( todayInUnix != Number( foundPatient.last_active_date)){
        try {
            console.log(todayInUnix);
            foundPatient.latest_log = [];
            foundPatient.last_active_date = todayInUnix;

            await Patient.updateOne(
                // condition
                {_id: id},
                // value to be change
                {$set:
                    {
                        latest_log: [],
                        last_active_date: todayInUnix
                    }
                }
            );
        }
        catch (err){
            console.log(err);
        }
    }

    return {
        status: true,
        data: foundPatient
    }
}

const extractUnixOfYYYY_MM_DD = (unix) => {
    return Math.floor(unix / 86400000) * 86400000;
}
module.exports = {
    getAllPatientOfClinician,
    getOnePatient,
    checkCacheLog
}