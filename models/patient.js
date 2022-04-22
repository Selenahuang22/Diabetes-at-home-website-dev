const mongoose = require("mongoose")

const patientSchema = new mongoose.Schema({  // declare a Mongoose schema
  first_name: String,
  last_name: String,
  weight: Number,
  exercises: Number,
  blood_glucose_level: Number,
  insulin_take: Number,
  comment: Number
})

const Patient = mongoose.model("Patient", patientSchema) // compile the schema into a model

module.exports = Patient // make model available to other files