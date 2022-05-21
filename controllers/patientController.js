const Patient = require("../models/patient")
const Clinician = require("../models/clinician")
const HealthData = require("../models/healthData");
const healthDataController = require('./healthDataController')
const authenticator = require("../util/authenticator");
const Message = require("../models/message");

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

const patientViewData = async (req, res) => {       
    let thisPatient = await Patient.findById(req.user._id).lean()    

    
    if (thisPatient) {
        thisPatient = await _clearCacheIfExpired(thisPatient)
        let healthDatas = await HealthData.find({owner: thisPatient._id})

        // sort the data 
        healthDatas.sort((a, b) =>{ return a.time.getUTCMilliseconds() - b.time.getUTCMilliseconds()})

        let dateDict = {}
        healthDatas.forEach(
            (data) => {
                let key = data.data_name
                if(key == "blood glucose level"){
                    key = "bgl"
                }
                if( key == "insulin take"){
                    key = "insulin"
                }
                    
                try{
                        
                    dateDict[data.time.toLocaleDateString()][key] = data.value
                }catch(err)
                {
                    dateDict[data.time.toLocaleDateString()] = {
                        "bgl": "-",
                        "weight": "-",
                        "insulin": "-",
                        "exercise": "-"
                    }
                    dateDict[data.time.toLocaleDateString()][key] = data.value
                }
            }
        )
        let array = []
        for(date in dateDict){
            let healthData = {date, ...dateDict[date]}
            array.push(healthData)
        }
        console.log(array);
        res.render("B_viewData", {
            date: array, user: thisPatient, patient: thisPatient,
            home:"http://localhost:3000/patient/home"
        })
    } else {
        res.status(404).render('error', {errorCode: '404', message: 'Page is not accessible.', home:"http://localhost:3000/patient/home"})
    }
    
}


const getOnePatientAndRender = async (req, res) => {        
    let patient = await Patient.findById(req.user._id).lean()


    if(patient) {
        patient = await _clearCacheIfExpired(patient)
        let clinician = await Clinician.findOne({email: patient.clinician_email}).lean()

        let extractData = {
            first_name: patient.first_name,
            last_name: patient.last_name,
            user_name: patient.user_name,
            DOB: patient.DOB,
            biography: patient.biography
        }
        extractData.bgl = {
            lower:  patient.health_data["blood glucose level"].lower,
            upper: patient.health_data["blood glucose level"].upper,
            require: patient.health_data["blood glucose level"].require,
            value: "-"
        },
        extractData.insulin = {
            lower:  patient.health_data["insulin take"].lower,
            upper: patient.health_data["insulin take"].upper,
            require: patient.health_data["insulin take"].require,
            value: "-"
        }
        extractData.exercise = {
            lower:  patient.health_data["exercise"].lower,
            upper: patient.health_data["exercise"].upper,
            require: patient.health_data["exercise"].require,
            value: "-"
        }
        extractData.weight = {
            lower:  patient.health_data["weight"].lower,
            upper: patient.health_data["weight"].upper,
            require: patient.health_data["weight"].require,
            value:  "-"
        }
        patient.latest_log.forEach(
            data => {
                if(data.name == "blood glucose level"){
                    extractData.bgl.value = data.value
                }
                if(data.name == "insulin take"){
                    extractData.insulin.value = data.value
                }
                if(data.name == "exercise"){
                    extractData.exercise.value = data.value
                }
                if(data.name == "weight"){
                    extractData.weight.value = data.value
                }
            }
        )
        extractData.name = `${patient.first_name} ${patient.last_name}`
        extractData.id = patient._id
        
        // find the support message
        let msg = await Message.find({
            patient_id: patient._id
        }).sort({"time":-1})
        if(msg != []){
            msg = msg[0].content
        }else{
            msg = ""
        }
        res.render('patientHome', {
            "id": req.params.id,
            "thispatient": extractData,
            "clinician": clinician,
            'time': new Date().toLocaleDateString(),
            'user': patient,
            home:"http://localhost:3000/patient/home",
            support_message: msg
        })
    } else {
        res.status(404).render('error', {errorCode: '404', message: 'Page is not accessible.', home:"http://localhost:3000/patient/home"})
    }
        
}

const onePatientRecord = async (req, res) => {
    // check if the log cache need to be clear (expired)
    let patient = await Patient.findById(req.user._id).lean()
        
    // determin the time series that are not log for today
    let logged = []
    if(patient) {
        patient = await _clearCacheIfExpired(patient)
        for(var i of patient.latest_log){
            logged.push(i.name)
        }
        let log_glucose = true
        let log_weight = true
        let log_insulin = true 
        let log_exercise = true
        let required_glucose = false
        let required_weight = false
        let required_insulin = false
        let required_exercise = false

        if(patient.health_data["blood glucose level"].require){
            required_glucose = true
            log_glucose = !logged.includes("blood glucose level")
        }
        if(patient.health_data["weight"].require){
            required_weight = true
            log_weight = !logged.includes("weight")
        }
        if(patient.health_data["insulin take"].require){
            required_insulin = true
            log_insulin = !logged.includes("insulin take")
        }
        if(patient.health_data["exercise"].require){
            required_exercise = true
            log_exercise = !logged.includes("exercise")
        }
        
        res.render('dataEnter', {
            id: req.params.id, 
            log_glucose: log_glucose,
            log_weight: log_weight,
            log_exercise: log_exercise,
            log_insulin: log_insulin,
            required_glucose: required_glucose,
            required_weight: required_weight,
            required_insulin: required_insulin,
            required_exercise: required_exercise,
            user: patient
        })
    } else{
        res.status(404).render('error', {errorCode: '404', message: 'Page is not accessible.', home:"http://localhost:3000/patient/home"})
    }
    
}


const showProfile = async (req, res) => {
    let patient = await Patient.findById(req.user._id).lean()

    if(patient){
    
        patient = await _clearCacheIfExpired(patient)
        
        res.render('B_editProfile', {
            "id": req.params.id,
            "user": patient,
            "userType": 'patient',
            "homeType": 'home',
            home:"http://localhost:3000/patient/home"
        })
    }
    else res.status(404).render('error', {errorCode: '404', message: 'Page is not accessible.', home:"http://localhost:3000/patient/home"})
}

const editProfile = async (req, res) => {
    let directPath = '/patient/home'

    // we can perform data interity check here

    try {
        await Patient.updateOne(
            // condition
            {_id: req.user._id},
            // value to be change
            {$set:
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    user_name: req.body.user_name,
                    DOB: req.body.DOB,              
                }
            }
        );

        if (req.body.biography) {
            await Patient.updateOne(
                {_id: req.user._id},
                {
                    $set: { biography: req.body.biography}
                }
            )
        }

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
        res.status(404).render('error', {errorCode: '404', message: 'Error occur when try to send new Data.', home:"http://localhost:3000/patient/home"}) 
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
    else{
        console.log("============================================");
    }
    return foundPatient
}

const submitLog = async (req, res) => {
 
    // we need to check for cache expiration again
    let patient = await Patient.findById(req.user._id).lean()
    patient = await _clearCacheIfExpired(patient)
    let directPath = '/patient/home'
    let result = false
    // we can perform data interity check here

    // cache the log value
    if(req.body.value != ""){
        // ensure the log is not exit in the cache
        if(! patient.latest_log.includes(req.body.data_name)){
            console.log(req.body);
            result = await cacheTheLog(req.body.data_name, req.body.value, patient);
            
            // if the caching successfull we can add the data to db
            if(result.status) {
                result = await healthDataController.insert(req.user._id, req.body.data_name, req.body.comment, req.body.value)
            }
        }
            
    }
    (result)
        ? res.redirect(directPath)        
        : res.status(404).render('error', {errorCode: '404', message: 'Error occur when try to send Data.', home:"http://localhost:3000/patient/home"}) 
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
            res.redirect(`/clinician/patient/${patient._id}`)
        }catch (err){
            
        }

    })   
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
    createNewPatient,
    patientViewData 
}