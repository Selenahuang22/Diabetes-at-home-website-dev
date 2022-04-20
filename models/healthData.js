const mongoose = require("mongoose")
const Patient = require("./patient")

const healthDataSchema = new mongoose.Schema({  // declare a Mongoose schema
  time: Date,
  name: String,
  comment: String,
  owner: Patient
})

const HealthData = mongoose.model("HealthData", healthDataSchema) // compile the schema into a model

module.exports = HealthData // make model available to other files