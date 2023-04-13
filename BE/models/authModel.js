const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");
const { USER_TYPE } = require("../shared/Constants");

const Schema = mongoose.Schema;

const authSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: USER_TYPE.MANAGER,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

authSchema.methods.matchPassword = async function (enteredPass) {
  const result = await bcrypt.compare(enteredPass, this.password);
  return result;
};

authSchema.pre("save", async function (next) {
  if (!this.isModified) return next();

  const salt = await bcrypt.genSalt(10);
  const result = await bcrypt.hash(this.password, salt);
  this.password = result;
});

module.exports = mongoose.model("Auth", authSchema);
