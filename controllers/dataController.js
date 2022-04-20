const HealthData = require('../models/healthData')

const insertData = async (req, res, next) => {
    try {
        newData = new HealthData( req.body )
        await newData.save()
        return res.redirect('/patientRecord')
    } catch (err) {
        return next(err)
    }
}

module.exports = {
    insertData,
}