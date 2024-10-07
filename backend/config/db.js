const mongoose = require("mongoose");

const db = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MONGO DB CONNECTED");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = db;
