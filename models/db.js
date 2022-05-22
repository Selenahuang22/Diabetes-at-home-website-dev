
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const mongoose = require("mongoose")


mongoose.connect( process.env.MONGO_URL || 'mongodb+srv://info30005:info30005123456@cluster0.vffd2.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "d1"
})

const db = mongoose.connection

db.on("error", err => {
  console.error(err);
  process.exit(1)
})

db.once("open", async () => {
  console.log("Mongo connection started on " + db.host + ":" + db.port)
})

require("./patient")
