const { redirect } = require("express/lib/response");
const { Decimal128 } = require("mongodb");
const Clinician = require("../models/clinician");
const HealthData = require("../models/healthData");
const Patient = require("../models/patient");
const ClinicianNote = require('../models/clinicianNote');
const Message = require("../models/message")
const patientController = require("./patientController");
const authenticator = require("../util/authenticator")

const renderProfile = async (req, res) => {
    console.log(req.user);
    let clinician = req.user
    if(clinician){        
       res.render("clinicianProfile", 
       {
           thisClinician: clinician, 
           user: clinician,
           home: "http://localhost:3000/clinician/profile"
        })
    } else {
        res.status(404).render('error', 
        {
            errorCode: '404', 
            message: 'Clinician Does Not exist.',
            home: "http://localhost:3000/clinician/profile",
            user: req.user
        })
        
    }
}

const getClinicianPatients = async (id) => {
    let clinician = await Clinician.findOne({_id: id}).lean()
    if(clinician){
        
        // to make it consistence with other method
        return {status:true, data: await patientController.getAllPatientOfClinician(clinician.email)}
    }
}

const renderDashBoard = async (req, res) => {   
    let clinician = req.user

    if(clinician){
        // retrieve all of his patient using email
        let allPatient = await Patient.find(
            {clinician_email: clinician.email}
        )

        // format each patient 
        let formatedPatientList = []
        allPatient.forEach(
            patient => {
                let extractData = {}
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
                    value: "-"
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
                formatedPatientList.push(extractData)
            }
        )
        return res.render("clinicianHome", 
            {
                patient: formatedPatientList,
                user: clinician,
                home: "http://localhost:3000/clinician/profile"
            })
    }    
    res.status(404).render('error', {errorCode: '404', message: 'Clinician Does Not exist.',
    home: "http://localhost:3000/clinician/profile"})

}

const showProfile = async (req, res) => {
    let clinician = req.user

    if(clinician)
        res.render('B_editProfile', {
            "id": req.params.id,
            "user": clinician,
            "userType": 'clinician',
            "homeType": 'profile',
            home: "http://localhost:3000/clinician/profile"
        })
    else res.status(404).render('error', 
    {
        errorCode: '404', 
        message: 'Clinician Does Not exist.',
        home: "http://localhost:3000/clinician/profile",
        user: req.user
    })
}

const editProfile = async (req, res) => {
    let directPath = '/clinician/profile'

    // we can perform data interity check here

    try {
        await Clinician.updateOne(
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
            await Clinician.updateOne(
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
                    
                    await Clinician.updateOne(
                        {_id: req.user._id},
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
        res.status(404).render('error', 
        {
            errorCode: '404', 
            message: 'Clinician Does Not exist.',
            home: "http://localhost:3000/clinician/profile",
            user: req.user
        })
    }
}

const clinicianViewData = async (req, res) => {       
    let thisPatient = await Patient.findById(req.params.patientid).lean()   
    let clinician = req.user  

    if(clinician){
        if (thisPatient) {
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
                date: array, user: clinician, patient: thisPatient
            })
        } else {
            res.status(404).render('error', 
        {
            errorCode: '404', 
            message: 'Clinician Does Not exist.',
            home: "http://localhost:3000/clinician/profile",
            user: req.user
        })}
    }else{
        res.status(404).render('error', 
        {
            errorCode: '404', 
            message: 'Clinician Does Not exist.',
            home: "http://localhost:3000/clinician/profile",
            user: req.user
        })}
}


const renderPatientRegisterPage = async (req, res) => {
    let clinician = req.user
    res.render("C_patientRegister", {id: req.params.id, user: clinician, home:"http://localhost:3000/clinician/profile"})
}

const registerPatient = async (req, res) => {
    let clinician = req.user

    if(clinician){
        // this method will be use to add key data to the patient data.
        let logTimeSeries = req.body.health_data
        req.body.last_active_date =new Date()
        req.body.clinician_email = clinician.email
        req.body.created = new Date()
        req.body.health_data = {
            "blood glucose level": {
                upper: 100,
                lower: 0,
                require: false
            },"weight": {
                upper: 100,
                lower: 0,
                require: false
            },"insulin take": {
                upper: 100,
                lower: 0,
                require: false
            },"exercise": {
                upper: 100,
                lower: 0,
                require: false
            }
        }

        for(hd of logTimeSeries){
            try {
                req.body.health_data[hd].require = true
            }catch(err){
                console.log(hd);
            }
        }
        
        patientController.createNewPatient(req, res)
    } else {
        res.status(404).render('error', 
        {
            errorCode: '404', 
            message: 'Clinician Does Not exist.',
            home: "http://localhost:3000/clinician/profile",
            user: req.user
        })
    }
}

const renderClinicalNotes = async (req, res) => {
    let clinician = req.user
    
    if(clinician){
        let notes = await ClinicianNote.find(
            {clinician_id: clinician._id}
        ).lean()
        let adjusted = []
        let allNotes = []
        
        for (var hd of notes) {

            let thisPatient = await Patient.findById(hd.patient_id).lean()     
            
            let adjustedData = {
                name: `${thisPatient.first_name} ${thisPatient.last_name}`,
                time: `${hd.time.toLocaleDateString()} ${hd.time.toLocaleTimeString()}`,
                content: hd.content,
            }
               
            adjusted.push(adjustedData)
        }
        if(adjusted != []){
            allNotes = [...allNotes, ...adjusted]
        }
 
        res.render("clinicianNotes",
            {
                allNotes: allNotes,
                id: req.params.id,
                user: clinician,
                home: "http://localhost:3000/clinician/profile",
            }
        )
    } else {
        res.status(404).render('error', 
        {
            errorCode: '404', 
            message: 'Clinician Does Not exist.',
            home: "http://localhost:3000/clinician/profile",
            user: req.user
        })
    }
}
const renderPatientComments = async (req, res) => {
    let clinician = req.user

    if(clinician){
        // retrieve all the comment of patient
        let patients = await Patient.find(
            {clinician_email: clinician.email}
        ).lean()
        
        let comments = []

        if(patients){
            // retrieve all patient comment that is recently
            // DD-MM-YYYY 00:01
            const today = new Date()

            const tmr = new Date(today)
            tmr.setDate(tmr.getDate() + 1)

            const last2Day = new Date(today)
            last2Day.setDate(last2Day.getDate() - 3)

            for(var patient of patients){
                let recentHD = await HealthData.find({
                    time: {$lte: tmr, $gte: last2Day},
                    owner: patient._id
                })
                // create a new list for which each data is well format
                let adjusted = []
                
                recentHD.forEach(hd => {
                    
                    let adjustedData = {
                        name: `${patient.first_name} ${patient.last_name}`,
                        owner: hd.owner,
                        time: `${hd.time.toLocaleDateString()} ${hd.time.toLocaleTimeString()}`,
                        comment: hd.comment,
                        data_name: hd.data_name,
                        value: hd.value,
                        lower: patient.health_data[hd.data_name].lower,
                        upper: patient.health_data[hd.data_name].upper
                    }
               
                    adjusted.push(adjustedData)
                })
                if(adjusted != []){
                    comments = [...comments, ...adjusted]
                }
            }
        }
        res.render("C_patientComments",
            {
                comments: comments,
                id: req.params.id,
                user: clinician,
                home:"http://localhost:3000/clinician/profile"
            }
        )
    }
}


const renderPatientProfile = async (req, res) => {
    // retrieve patient detail 
    let patient = await Patient.findById(req.params.patientId).lean()
    let clinician = req.user

    if(patient){
        res.render("C_patientProfile",
            {
                thispatient: patient,
                clinicianid: req.params.id,
                user: clinician,
                id: req.params.id,
                bgl_lower: patient.health_data["blood glucose level"].lower,
                bgl_upper: patient.health_data["blood glucose level"].upper,
                weight_lower: patient.health_data["weight"].lower,
                weight_upper: patient.health_data["weight"].upper,
                insulin_lower: patient.health_data["insulin take"].lower,
                insulin_upper: patient.health_data["insulin take"].upper,
                exercise_lower: patient.health_data["exercise"].lower,
                exercise_upper: patient.health_data["exercise"].upper,
                bgl: patient.health_data["blood glucose level"].require,
                weight: patient.health_data["weight"].require,
                insulin: patient.health_data["insulin take"].require,
                exercise: patient.health_data["exercise"].require,
                home:"http://localhost:3000/clinician/profile"
            }
        )
    }
}

const modifyPatientLog = async (req, res) => {

    // retrieve the patien
    let patient = await Patient.findById(req.params.patientId)

    // interpret the data and set it accordingly
    if(patient){

        patient.health_data["blood glucose level"].require = (req.body.bgl_toggle == "true")? true: false  
        patient.health_data["blood glucose level"].lower = (req.body.bgl_lower == "") 
            ? patient.health_data["blood glucose level"].lower : Decimal128(req.body.bgl_lower)
        patient.health_data["blood glucose level"].upper = (req.body.bgl_lower == "") 
            ? patient.health_data["blood glucose level"].upper : Decimal128(req.body.bgl_upper)

        patient.health_data["weight"].require = (req.body.weight_toggle == "true")? true: false 
        patient.health_data["weight"].lower = (req.body.weight_lower == "") 
            ? patient.health_data["weight"].lower : Decimal128(req.body.weight_lower)
        patient.health_data["weight"].upper = (req.body.weight_lower == "") 
            ? patient.health_data["weight"].upper : Decimal128(req.body.weight_upper)

        patient.health_data["insulin take"].require = (req.body.insulin_toggle == "true")? true: false
        patient.health_data["insulin take"].lower = (req.body.insulin_lower == "") 
            ? patient.health_data["insulin take"].lower : Decimal128(req.body.insulin_lower)
        patient.health_data["insulin take"].upper = (req.body.insulin_lower == "") 
            ? patient.health_data["insulin take"].upper : Decimal128(req.body.insulin_upper)

        patient.health_data["exercise"].require = (req.body.exercise_toggle == "true")? true: false 
        patient.health_data["exercise"].lower = (req.body.exercise_lower == "") 
            ? patient.health_data["exercise"].lower : Decimal128(req.body.exercise_lower)
        patient.health_data["exercise"].upper = (req.body.exercise_lower == "") 
            ? patient.health_data["exercise"].upper : Decimal128(req.body.exercise_upper)
        

        try{
            await patient.save()
        }catch(err){
            console.log(err);
        }
    }

    res.redirect(`/clinician/patient/${req.params.patientId}`)
}


const addClinicianNote = async (req, res) => {
    if(req.body.noteContent != ""){
        //add the new clinician note
        let note = new ClinicianNote({
            clinician_id: req.user._id,
            patient_id: req.params.patientId,
            content: req.body.noteContent,
            time: new Date()
        })

        console.log(note);

        try{
            await note.save()
        }catch(err){
            console.log(err);
        }
    }
    
    res.redirect(`/clinician/patient/${req.params.patientId}`)
}

const addSuppportMsg = async (req, res) => {
    if(req.body.msgContent != ""){
        //add the new clinician note
        let patient = await Patient.findById(req.params.patientId)
        if (patient) {
            await Patient.updateOne(
                // condition
                {_id: req.params.patientId},
                // value to be change
                {$set:
                    {
                        support_message: req.body.msgContent                               
                    }
                }
            );
        }

        let msg = new Message({
            clinician_id: req.params.id,
            patient_id: req.params.patientId,
            content: req.body.msgContent,
            time: new Date()
        })
        try{
            await msg.save()
        }catch(err){
            console.log(err);
        }
    }
    
    res.redirect(`/clinician/patient/${req.params.patientId}`)
}

module.exports = {
    getClinicianPatients,
    renderDashBoard,
    renderProfile,
    renderPatientRegisterPage,
    registerPatient,
    renderPatientComments,
    clinicianViewData,
    renderPatientProfile,
    modifyPatientLog,
    addClinicianNote,
    addSuppportMsg,
    showProfile,
    editProfile,
    renderClinicalNotes
}