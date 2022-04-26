const { Patient } = require("../models/patient")


const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find().lean()
        return res.render('clinicianHome', { patient: patients })
    } catch (err) {
        console.log(err)
    }
}

const getOnePatient =  async (req, res) => { // get one food, and render it
	try {
		const patient = await Patient.findOne( {_id: req.params.id} ).lean()
		return res.render('patientHome', {"thispatient": patient})	
	} catch (err) {
		console.log(err)
	}
}

module.exports = {
    getAllPatients,
    getOnePatient,
}