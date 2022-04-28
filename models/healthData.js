const mongoose = require("mongoose")

const healthDataSchema = new mongoose.Schema({  // declare a Mongoose schema
  time: {type: Number, require: true},
  name: {type: String , enum: [
    /**list down all possible time series */
    "Blood glucose data"
  ], require: true},
  comment: String,
  value: {type: String, require: true},

  // this will be referencing the email of patient
  owner: {type: String, require: true}
})

const HealthData = mongoose.model("HealthData", healthDataSchema) // compile the schema into a model

module.exports = HealthData