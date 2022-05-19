const mongoose = require("mongoose");

const clinicianNoteSchema = new mongoose.Schema(
    {
        clinician_id: {type: String, require: true},
        patient_id: {type: String, require: true},
        content: {type: String, require: true},
        time: {type: Date, require: true}
    }
)

const ClinicianNote = mongoose.model("ClinicianNote", clinicianNoteSchema)

module.exports = ClinicianNote