//*** health data ROUTES STARTS HERE ***//

const { Patient, HealthData } = require("../models/patient")


const insertData = async (req, res, next) => {
    let thisPatient = await Patient.findOne( {first_name: 'Pat'})
    let thisPatientId = thisPatient._id
    let directPath = '/patient/'+thisPatientId+'/home'

    try {
        newHealthData = new HealthData( req.body )
        await newHealthData.save()
        thisPatient.health_data.push(newHealthData)
        await thisPatient.save()
        return res.redirect(directPath)
    } catch (err) {
        return next(err)
    }
}

module.exports = {
    insertData,
}
