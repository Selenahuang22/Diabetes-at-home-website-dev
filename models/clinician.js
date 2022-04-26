
const mongoose = require("mongoose")

cosnt clinicianSchema = new mongoose.Schema(
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