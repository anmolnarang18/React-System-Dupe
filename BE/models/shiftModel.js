const mongoose = require("mongoose");

const { SHIFT_STATUS } = require("../shared/constants");

const Schema = mongoose.Schema;

const shiftSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    swappedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    status: {
      type: String,
      default: SHIFT_STATUS.NOT_ASSIGNED,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);
