
const mongoose = require("mongoose")

const clinicianSchema = new mongoose.Schema(
    {
        // personal detail
        first_name: { type: String, require: true},
        last_name: { type: String, require: true},
        user_name: { type: String, require: true},
        
        // credential
        email: { type: String, require: true, unique: true},
        password: { type: String, require: true, minlength: 8},
  
        // Using long value - that represent the unix value should be more appropriate?
        DOB: { type: String, require: true},

        biography: { type: String, require: true},
    }
)

const Clinician = mongoose.model("Clinician", clinicianSchema)

module.exports = Clinician