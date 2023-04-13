const Shift = require("../models/shiftModel");

const { USER_TYPE, SHIFT_STATUS } = require("../shared/constants");

exports.createShift = async (req, res, next) => {
  const { description, startDate, endDate, confirmedBy, createdBy } = req.body;

  if (!description || !startDate || !endDate || !confirmedBy || !createdBy) {
    return res.status(422).json("Please enter all required fields.");
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    try {
      const newShift = await Shift.create({
        description,
        startDate,
        endDate,
        confirmedBy,
        createdBy,
        status: SHIFT_STATUS.NOT_ASSIGNED,
      });

      res.status(201).json({
        message: "Shift created!",
        data: newShift,
      });
    } catch (error) {
      console.log("ERROR", error);
      res.status(500).json("Something went wrong!");
    }
  } else {
    res.status(422).json("You are not authorized to create a shift.");
  }
};

exports.confirmShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (req.user.type === USER_TYPE.MANAGER) {
    return res.status(502).json("User not authorized!");
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      let obj = {
        status: SHIFT_STATUS.CONFIRMED,
        confirmedBy: req.user._id,
      };

      if (requiredShift.status === SHIFT_STATUS.SWAP) {
        obj = {
          swappedFrom: requiredShift.confirmedBy,
          ...obj,
        };

        const confirmShift = await Shift.updateOne(
          {
            _id: shiftId,
            $or: [
              { status: { $eq: SHIFT_STATUS.NOT_ASSIGNED } },
              { status: { $eq: SHIFT_STATUS.SWAP } },
            ],
          },
          {
            $set: obj,
          }
        );

        res.status(200).json({
          message: "Shift confirmed!",
          data: confirmShift,
        });
      }
    }
  } catch (error) {
    console.log("CONFIRM SHIFT ERROR", error);
    res.status(422).json(`This shift can't be confirmed!`);
  }
};

exports.cancelShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (req.user.type === USER_TYPE.MANAGER) {
    return res.status(502).json("User not authorized!");
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.abs(requiredShift.startDate - new Date()) / 36e5
      );

      if (diffTime <= 4) {
        return res
          .status(422)
          .json(
            `You can only cancel shift brfore 4 hours of it's starting time.`
          );
      }

      const confirmShift = await Shift.updateOne(
        {
          _id: shiftId,
          status: SHIFT_STATUS.CONFIRMED,
          confirmedBy: req.user._id,
        },
        {
          $set: {
            status: SHIFT_STATUS.CANCELLED,
          },
        }
      );

      res.status(200).json({
        message: "Shift cancelled!",
        data: confirmShift,
      });
    }
  } catch (error) {
    console.log("CANCEL SHIFT ERROR", error);
    res.status(422).json(`This shift can't be cancelled!`);
  }
};

exports.swapShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (req.user.type === USER_TYPE.MANAGER) {
    return res.status(502).json("User not authorized!");
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.abs(requiredShift.startDate - new Date()) / 36e5
      );

      if (diffTime <= 4) {
        return res
          .status(422)
          .json(
            `You can only swap shift before 4 hours of it's starting time.`
          );
      }

      const swapShift = await Shift.updateOne(
        {
          _id: shiftId,
          confirmedBy: req.user._id,
          status: SHIFT_STATUS.CONFIRMED,
        },
        {
          $set: {
            status: SHIFT_STATUS.SWAP,
          },
        }
      );

      res.status(200).json({
        message: "Shift set to swap!",
        data: swapShift,
      });
    }
  } catch (error) {
    console.log("SWAP SHIFT ERROR", error);
    res.status(422).json(`This shift can't be swapped!`);
  }
};

exports.completeShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (req.user.type === USER_TYPE.MANAGER) {
    return res.status(502).json("User not authorized!");
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.abs(new Date() - requiredShift.endDate) / 36e5
      );

      if (diffTime <= 0) {
        return res
          .status(422)
          .json(
            `You can't complete your shift during shift timings.`
          );
      }

      const completeShift = await Shift.updateOne(
        {
          _id: shiftId,
          status: SHIFT_STATUS.CONFIRMED,
          confirmedBy: req.user._id,
        },
        {
          $set: {
            status: SHIFT_STATUS.COMPLETED,
          },
        }
      );

      res.status(200).json({
        message: "Shift cancelled!",
        data: completeShift,
      });
    }
  } catch (error) {
    console.log("CANCEL SHIFT ERROR", error);
    res.status(422).json(`This shift can't be completed!`);
  }
};

exports.getshifts = async (req, res, next) => {
  const { status } = req.query;

  try {
    const keyword = status
      ? {
          $and: [
            {
              $or: [
                { createdBy: { $eq: req.user._id } },
                { confirmedBy: { $eq: req.user._id } },
              ],
            },
            { status: { $eq: status } },
          ],
        }
      : {};
    const shifts = await Task.find(keyword)
      .populate("confirmedBy", "-password")
      .populate("createdBy", "-password")
      .populate("swappedFrom", "-password");

    res.status(200).json({
      message: "Shifts fetched!",
      data: shifts,
    });
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json("Something went wrong!");
  }
};

exports.updateShift = async (req, res, next) => {
  const { shiftId, status } = req.body;

  if (req.user.status === USER_TYPE.MANAGER) {
    res.status(502).json("User not authorized!");
  }

  try {
    const requiredTask = await Task.findById(taskId);

    if (
      requiredTask.status === TASK_STATUS.NOT_STARTED &&
      status === TASK_STATUS.IN_PROGRESS
    ) {
      console.log("COMING INN", requiredTask);
      const updatedTask = await Task.updateOne(
        {
          _id: taskId,
          assignedTo: req.user._id,
        },
        {
          $set: {
            status,
          },
        }
      );
      console.log("TASK UPDATED", updatedTask);
      res.status(200).json({
        message: "Task status updated!",
        data: updatedTask,
      });
    } else if (
      requiredTask.status === TASK_STATUS.IN_PROGRESS &&
      status === TASK_STATUS.COMPLETED
    ) {
      if (totalHours > 0) {
        const updatedTask = await Task.updateOne(
          {
            _id: taskId,
            assignedTo: req.user._id,
          },
          {
            $set: {
              status,
              totalHours,
              completionDate: new Date(),
            },
          }
        );

        res.status(200).json({
          message: "Task completed!",
          data: updatedTask,
        });
      } else {
        res.status(422).json("Invalid total hours.");
      }
    } else {
      console.log(
        "ERROR TASK",
        `Can not update ${requiredTask.status} to ${status}`
      );
      res
        .status(422)
        .json(`Can not update ${requiredTask.status} to ${status}`);
    }
  } catch (error) {}
};
