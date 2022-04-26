const mongoose = require("mongoose")

const healthDataSchema = new mongoose.Schema({  // declare a Mongoose schema
  data_name: {type: String, require: true},
  value: {type: Number, require: true},
  date: {type: String, require: true},
  comment: String
})

const patientSchema = new mongoose.Schema({  // declare a Mongoose schema
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
  
  // this is the meta data for the specific time series of this patient
  health_data: [healthDataSchema]


})

// compile the Schemas into Models
const Patient = mongoose.model("Patient", patientSchema);
const HealthData = mongoose.model("HealthData", healthDataSchema)


module.exports = {Patient, HealthData}; // make model available to other files