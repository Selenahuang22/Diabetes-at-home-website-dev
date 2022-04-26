
const mongoose = require("mongoose")

const clinicianSchema = new mongoose.Schema(
    {
        // personal detail
        first_name: String,
        last_name: String,
        user_name: String,
        
        // credential
        email: { type: String, require: true, unique: true},
        password: { type: String, require: true},
    }
)

const Clinician = mongoose.model("Clinician", clinicianSchema)

module.exports = Clinician