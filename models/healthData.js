const mongoose = require("mongoose")

const healthDataSchema = new mongoose.Schema({  // declare a Mongoose schema
  time: {type: String, require: true},
  data_name: {type: String , enum: [
    /**list down all possible time series */
    "blood glucose level"
  ], require: true},
  comment: String,
  value: {type: Number, require: true},

  // this will be referencing the email of patient
  owner: {type: String, require: true}
})

const HealthData = mongoose.model("HealthData", healthDataSchema) // compile the schema into a model

module.exports = HealthData