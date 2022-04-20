const Patient = require('../models/patient')

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find().lean()
        return res.render('clinicianHome', { patient: patients })
    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    getAllPatients,
}