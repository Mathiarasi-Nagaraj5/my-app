const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://mathiarasinagarajn_db_user:z4Wgl42uCIU25PAP@cluster0.8ilxkjt.mongodb.net/elite-souls?appName=Cluster0"
  )
  .then(() => {
    console.log("Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });