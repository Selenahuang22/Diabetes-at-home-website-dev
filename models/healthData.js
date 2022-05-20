const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const healthDataSchema = new mongoose.Schema({  // declare a Mongoose schema
  time: {type: Date, require: true},
  data_name: {type: String , enum: [/** list all the possible time series */
    "blood glucose level",
    "weight",
    "exercise",
    "insulin take"
  ], require: true},
  comment: String,
  value: {type: Number, require: true},

  owner: {type: ObjectId, require: true}
})

const HealthData = mongoose.model("HealthData", healthDataSchema) // compile the schema into a model

module.exports = HealthData