const Patient = require("../models/patient")
const Clinician = require("../models/clinician")
const healthDataController = require('./healthDataController')
const authenticator = require("../util/authenticator")

/**
 * 
 * @param {String} email email of a clinician
 * @returns an array of patients manage by this clinician
 */
const getAllPatientOfClinician = async (email) => {
    // This is not the efficient approach, as it is very wasteful on computation power
    // in order to keep cache on check
    
    let allPatients = await Patient.find({clinician_email: email}).lean()
    let fixedPatient = await myAsyncLoop(allPatients)

    return {
        status:true, 
        data: fixedPatient
    }
}

/**
 * 
 * @param {Array} array an array of all patients for a particular clinician
 * @returns an array of patients who have been cleared cache 
 */
const myAsyncLoop = async (array) => { 
    const fixedPatient = []
    for(var patient of array) {
        const clearedPatient = await _clearCacheIfExpired(patient)
        fixedPatient.push(clearedPatient)
    }

    return fixedPatient
} 

/**
 * 
 * @param {String} id the string local id of the patient as in the mongo db
 * @returns JSON object with attribute as stored in the DB
 */
const getOnePatient = async (id) => {

    let foundPatient = await Patient.findOne({_id: id}).lean()
    foundPatient = await _clearCacheIfExpired(foundPatient)

    return { 
        status: true, 
        data: foundPatient
    }
}




const getOnePatientAndRender = async (req, res) => {        
    var result = await getOnePatient(req.params.id)

    if(result.status) {
        let clinician = await Clinician.findOne({email: result.data.clinician_email}).lean()
        res.render('patientHome', {
            "id": req.params.id,
            "thispatient": result.data,
            "clinician": clinician,
            'time': new Date().toLocaleDateString(),
            'user': result.data
        })
    } else {
        res.status(404).render('error', {errorCode: '404', message: 'Patient Does Not exist.'})
    }
        
}

const onePatientRecord = async (req, res) => {
    // check if the log cache need to be clear (expired)
    let checkResult = await getOnePatient(req.params.id)
        
    // determin the time series that are not log for today
    let logged = []
    if(checkResult.data) {
        let patient = checkResult.data
        for(var i of checkResult.data.latest_log){
            logged.push(i.name)
        }
        let log_glucose = false
        let log_weight = false
        let log_insulin = false 
        let log_exercise = false 

        if(patient.health_data["blood glucose level"].require){
           log_glucose = !logged.includes("blood glucose level")
        }
        if(patient.health_data["weight"].require){
            log_weight = !logged.includes("weight")
        }
        if(patient.health_data["insulin take"].require){
            log_insulin = !logged.includes("insulin take")
        }
        if(patient.health_data["exercise"].require){
            log_exercise = !logged.includes("exercise")
        }
        res.render('dataEnter', {
            id: req.params.id, 
            log_glucose: log_glucose,
            log_weight: log_weight,
            log_exercise: log_exercise,
            log_insulin: log_insulin
        })
    } else{
        res.status(404).render('error', {errorCode: '404', message: 'Patient Does Not exist.'})
    }
    
}


const showProfile = async (req, res) => {
    var result = await getOnePatient(req.params.id)

    if(result.status)
        res.render('B_editProfile', {
            "id": req.params.id,
            "user": result.data,
        })
    else res.status(404).render('error', {errorCode: '404', message: 'Patient Does Not exist.'})
}

const editProfile = async (req, res) => {
    let directPath = '/patient/'+req.params.id+'/home'

    // we can perform data interity check here

    try {
        await Patient.updateOne(
            // condition
            {_id: req.params.id},
            // value to be change
            {$set:
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    user_name: req.body.user_name,
                    DOB: req.body.DOB, 
                    biography: req.body.biography                 
                }
            }
        );

        // if they also want to change password, for now
        // @todo: optimise this
        if(req.body.password){
            if(authenticator.validatePass(req.body.password)){
                
                credential = {password: req.body.password}
                authenticator.generateHash(credential, async(_, hash) => {
                    
                    await Patient.updateOne(
                        {_id: req.params.id},
                        {
                            $set: { password: hash}
                        }
                    )
                })
            }
        }
        res.redirect(directPath)
    }
    catch (err){
        console.log(err);
        res.status(404).render('error', {errorCode: '404', message: 'Error occur when try to send new Data.'}) 
    }
}

/**
 * check if the cache of the patient is expired, if so => clear cache
 * @param {JSON} patient that is an object of schemas: patient
 * @returns that patient after clear ()
 */
const _clearCacheIfExpired = async (patient) => {
    let foundPatient = patient
    // we need to reset the cache log if it is expire, and update the corresponding data in our remote DB
    let today = new Date()
    if( today.getDate() != foundPatient.last_active_date.getDate() 
        || today.getMonth() != foundPatient.last_active_date.getMonth()
        || today.getFullYear() != foundPatient.last_active_date.getFullYear()){
        try {
            
            foundPatient.latest_log = [];
            foundPatient.last_active_date = today;

            await Patient.updateOne(
                // condition
                {_id: patient._id},
                // value to be change
                {$set:
                    {
                        latest_log: [],
                        last_active_date: today
                    }
                }
            );
        }
        catch (err){
            console.log(err);
        }
    }

    return foundPatient
}

const submitLog = async (req, res) => {
 
    // we need to check for cache expiration again
    let checkResult = await getOnePatient(req.params.id)
    let directPath = '/patient/'+req.params.id+'/home'
    let result = false
    // we can perform data interity check here

    // cache the log value
    if(req.body.value != ""){
        // ensure the log is not exit in the cache
        if(! checkResult.data.latest_log.includes(req.body.data_name)){
            console.log(req.body);
            result = await cacheTheLog(req.body.data_name, req.body.value, checkResult.data);
            
            // if the caching successfull we can add the data to db
            if(result.status) {
                result = await healthDataController.insert(req.params.id, req.body.data_name, req.body.comment, req.body.value)
            }
        }
            
    }
    (result)
        ? res.redirect(directPath)        
        : res.status(404).render('error', {errorCode: '404', message: 'Error occur when try to send Data.'}) 
}


/**
 * 
 * @param {String} name one of the pre-defined set of time series
 * @param {*} value 
 * @param {*} id 
 */
const cacheTheLog = async (name, value, patientData) => {
    let localPatient = patientData

    let cache = patientData.latest_log
    let status = false
    
    cache.forEach(element => {
        if(element.name == name){
            return
        }
    });

    cache.push(
        {
            name: name,
            value: value
        }
    )
    try{
        patientData.latest_log = cache
        await Patient.updateOne(
            {_id: patientData._id},
            {
                $set:{
                    latest_log: cache
                }
            }
        )
        status = true
    } catch(err){
        localPatient = err
    }

    return {
        status: status,
        data: localPatient
    }
}

const createNewPatient = async (req, res) => {
    let patient = new Patient(req.body)

    authenticator.generateHash(patient, async (data, password) => {
        patient.password = password

        try{
            await patient.save()
            res.redirect(`/${req.params.id}/dashboard`)
        }catch (err){
            
        }

    })
}

const extractUnixOfYYYY_MM_DD = (unix) => {
    return Math.floor(unix / 86400000) * 86400000;
}
module.exports = {
    getAllPatientOfClinician,
    getOnePatient,
    getOnePatientAndRender,
    onePatientRecord,
    submitLog,
    cacheTheLog,
    editProfile,
    showProfile,
    createNewPatient
}