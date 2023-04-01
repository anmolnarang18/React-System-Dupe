const User = require("../models/authModel");

const { generateToken } = require("../utils/generateToken");
const { EMAIL_VALIDATION, USER_TYPE } = require("../shared/Constants");
const sendError = require("../utils/sendError");

exports.login = async (req, res, next) => {
  const { email, password, type } = req.body;
  if (!email || !password) {
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
      // const isCorrect = await bcrypt.compare(password, user.password);
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
          createdBy: user.createdBy,
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
  const { name, email = "", password, type, createdBy } = req.body;

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

    if (type === USER_TYPE.MEMBER) {
      if (!createdBy) {
        return next(sendError(404, "Admin for member creation not found!"));
      } else {
        const adminUser = await User.findById(createdBy);

        if (!adminUser || adminUser.type !== USER_TYPE.ADMIN) {
          return next(sendError(422, "Only admins can create a member."));
        }
      }
    }

    User.create({
      name,
      email,
      password,
      type,
      createdBy,
    })
      .then((userData) => {
        const token = generateToken(userData.email, userData.password);

        res.status(201).json({
          message: "User created!",
          data: {
            email: userData.email,
            name: userData.name,
            createdBy: userData.createdBy,
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

exports.fetchMembers = async (req, res, next) => {
  try {
    const users = await User.find({
      type: { $eq: USER_TYPE.MEMBER },
    });
    res.status(200).json({
      message: "Members fetched successfully!",
      data: users,
    });
  } catch (error) {
    console.log("userController.js getAllMembers() error=", error);
    next(sendError(422, "Something went wrong"));
  }
};
