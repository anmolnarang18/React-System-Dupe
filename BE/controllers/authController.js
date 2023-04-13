const User = require("../models/authModel");

const { generateToken } = require("../utils/generateToken");
const { EMAIL_VALIDATION, USER_TYPE } = require("../shared/Constants");
const sendError = require("../utils/sendError");

exports.login = async (req, res, next) => {
 
  const { email, password, type } = req.body;
  if (!email || !password || !type) {
    return next(sendError(422, "Please enter all required fields."));
  }

  if (!EMAIL_VALIDATION.test(email)) {
    return next(sendError(422, "Please enter valid email address."));
  }

  if (password.length < 6) {
    return next(sendError(422, "Password must be atleast 6 characters long."));
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      if (user.type != type) return res.status(404).json("User not found!");
    
      const isCorrect = await user.matchPassword(password);
      if (!isCorrect) {
        return next(sendError(422, "Invalid email or password"));
      }

      const token = generateToken(user.email, user.password);

      return res.status(200).json({
        message: "User logged in!",
        data: {
          email: user.email,
          name: user.name,
          type: user.type,
          token,
          _id: user._id,
        },
      });
    } else {
      return next(sendError(404, "User not found!"));
    }
  } catch (error) {
    console.log("UserController.js login() Error=", error);
    next(sendError(504, "Something went wrong!"));
  }
};

exports.createUser = async (req, res, next) => {
  const { name, email = "", password, type } = req.body;

  if (!name || !email || !password || !type) {
    return next(sendError(422, "Please enter all required fields."));
  }

  if (!EMAIL_VALIDATION.test(email)) {
    return next(sendError(422, "Please enter valid email address."));
  }

  if (password.length < 6) {
    return next(sendError(422, "Password must be atleast 6 characters long."));
  }
  try {
    const user = await User.findOne({ email });

    if (user) return next(sendError(422, "User already exists!"));


    User.create({
      name,
      email,
      password,
      type,
    })
      .then((userData) => {
        const token = generateToken(userData.email, userData.password);

        res.status(201).json({
          message: "User created!",
          data: {
            email: userData.email,
            name: userData.name,
            type: userData.type,
            _id: userData._id,
            token,
          },
        });
      })
      .catch((err) => {
        console.log("auth.js signup Error=", err);
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(sendError(500, "Something went wrong!"));
      });
  } catch (error) {
    console.log("SIGNUP ERROR", error);
    next(sendError(500, "Something went wrong!"));
  }
};

exports.fetchWorkers = async (req, res, next) => {
  try {
    const users = await User.find({
      type: { $eq: USER_TYPE.WORKER },
    });
    res.status(200).json({
      message: "Workers fetched successfully!",
      data: users,
    });
  } catch (error) {
    console.log("userController.js fetchWorkers() error=", error);
    next(sendError(422, "Something went wrong"));
  }
};
