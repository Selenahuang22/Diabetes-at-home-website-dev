const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({  // declare a Mongoose schema
  // personal detail
  first_name: String,
  last_name: String,

  user_name: String,

  // credential
  email: { type: String, require: true, unique: true},
  password: { type: String, require: true},
  
  // Using long value - that represent the unix value should be more appropriate?
  DOB: Number,

  biography: String,
  
  // this is the meta data for the specific time series of this patient
  health_data: [
    // health data
    {
      name: { type: String, enum: [/** list all the possible time series */]},
      upper: {type: Number, require: true},
      lower: {type: Number, require: true}
    }
  ],

  // caching the latest log -> can be use to ensure that patient log their data daily
  latest_log: [
    {
      name: { type: String, enum: [/** list all the possible time series */
        "Blood glucose data"
      ]},
      value: {type: Number, require: true}
    }
  ],

  // using this we know when to refresh the last_log
  last_active_date: {type: Number, require: true},

  // this is the  email of the doctor who in charge of this patient
  clinician_email: {type: String, require: true}
});

const Patient = mongoose.model("Patient", patientSchema); // compile the schema into a model

module.exports = Patient; // make model available to other files