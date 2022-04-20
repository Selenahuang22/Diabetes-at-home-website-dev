const mongoose = require("mongoose")
const HealthData = require("./healthData")

const patientSchema = new mongoose.Schema({  // declare a Mongoose schema
  first_name: String,
  last_name: String,
  user_name: String,
  email: String,
  password: String,
  DOB: Date,
  biography: String,
  //health_data: [HealthData]
})

const Patient = mongoose.model("Patient", patientSchema) // compile the schema into a model

module.exports = Patient // make model available to other files