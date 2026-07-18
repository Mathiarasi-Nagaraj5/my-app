const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://mathiarasinagarajn_db_user:wMiHhcsQKk7y4X6H@cluster0.8ilxkjt.mongodb.net/?appName=Cluster0"
  )
  .then(() => {
    console.log("Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });