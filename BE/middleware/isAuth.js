const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../shared/constants");
const User = require("../models/authModel");

module.exports = async (req, res, next) => {
  const error = new Error("Not authorized!");
  error.statusCode = 401;

  const authToken = req.headers["access-token"];

  if (!authToken) {
    throw error;
  }

  if (authToken && authToken.startsWith("Bearer")) {
    const token = authToken.split(" ")[1];

    let decodedToken = null;

    try {
      decodedToken = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      console.log("isAuth.js Error=", err);

      err.statusCode = 500;
      throw err;
    }

    if (!decodedToken) {
      throw error;
    }

    req.user = await User.findOne({ email: decodedToken.email }).select(
      "-password"
    );
    next();
  }
};
