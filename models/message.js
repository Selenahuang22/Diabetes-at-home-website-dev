const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
    {
        clinician_id: {type: String, require: true},
        patient_id: {type: String, require: true},
        content: {type: String, require: true},
        time: {type: Date, require: true}
    }
)

const Message = mongoose.model("Message", messageSchema)

module.exports = Message