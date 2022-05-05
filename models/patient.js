const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT = 10;

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
  health_data: [
    // health data
    {
      name: { type: String, require: true, enum: [/** list all the possible time series */]},
      upper: {type: Number, require: true},
      lower: {type: Number, require: true}
    }
  ],

  // caching the latest log -> can be use to ensure that patient log their data daily
  latest_log: [
    {
      name: { type: String, enum: [/** list all the possible time series */
        "blood glucose level"
      ]},
      value: {type: Number, require: true}
    }
  ],

  // using this we know when to refresh the last_log
  // This one is a unix number for current date
  last_active_date: {type: Number, require: true},

  // this is the email of the doctor who in charge of this patient
  clinician_email: {type: String, require: true}
});

/**
 * This is a copied version from the lecture note
 */
patientSchema.pre("save",
  (next) => {
    const patient = this

    if( !patient.isModified('password')) {
      return next()
    }

    // encrypt the password
    bcrypt.hash(patient.password, 
      SALT, 
      (err, hash) => {
        if(err){
          return next(err)
        }

        patient.password = hash 
        next()
      }  
    )
  }
)

const Patient = mongoose.model("Patient", patientSchema); // compile the schema into a model

module.exports = Patient; // make model available to other files