const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const authRoute = require("./routes/authRoute");
const taskRoute = require("./routes/taskRoute");

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
app.use("/task", taskRoute);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8000);
    console.log("SERVER STARTED AT PORT 8000");
  })
  .catch((err) => {
    console.log("CONNECTION ERROR", err);
  });
