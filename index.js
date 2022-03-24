const express = require("express");
const app = express();
const userSign = require("./routes/user");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", userSign);
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@jwt-auth.6ayon.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const databaseConfigurations = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(uri, databaseConfigurations)
  .then((res) =>
    app.listen(port, () => console.log(`Server is running on port ${port}`))
  )
  .catch((e) => console.log(e.message));
