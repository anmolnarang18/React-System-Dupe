const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const authRoute = require("./routes/authRoute");
const shiftRoute = require("./routes/shiftRoute");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const { DB_URI } = require("./shared/constants");

const app = express();

//Middlewares
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,search,access-token"
  );

  next();
});

app.use("/auth", authRoute);
app.use("/shift", shiftRoute);

app.use(notFound);
app.use(errorHandler);
// '192.168.1.73'
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8000,'192.168.1.73',() => {

      console.log("SERVER STARTED AT PORT 8000");
    });
  })
  .catch((err) => {
    console.log("CONNECTION ERROR", err);
  });
