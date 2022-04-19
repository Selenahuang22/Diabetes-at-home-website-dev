require('dotenv').config()    // for database login details
const mongoose = require("mongoose")


mongoose.connect( process.env.MONGO_URL || 'mongodb://localhost', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "demo"
})

const db = mongoose.connection

db.on("error", err => {
  console.error(err);
  process.exit(1)
})

db.once("open", async () => {
  console.log("Mongo connection started on " + db.host + ":" + db.port)
})

//require("./food")
