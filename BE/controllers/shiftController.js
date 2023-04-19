const Shift = require("../models/shiftModel");
const sendError = require("../utils/sendError");

const { USER_TYPE, SHIFT_STATUS } = require("../shared/constants");

exports.createShift = async (req, res, next) => {
  const { description, startDate, endDate } = req.body;

  if (!description || !startDate || !endDate) {
    return next(sendError(422, "Please enter all required fields."));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    try {
      const newShift = await Shift.create({
        description,
        startDate,
        endDate,
        createdBy: req.user._id,
        status: SHIFT_STATUS.NOT_ASSIGNED,
      });

      res.status(201).json({
        message: "Shift created!",
        data: newShift,
      });
    } catch (error) {
      console.log("ERROR", error);
      next(sendError(500, "Something went wrong!"));
    }
  } else {
    next(sendError(422, "You are not authorized to create a shift."));
  }
};

exports.updateShift = async (req, res, next) => {
  const { description, startDate, endDate, shiftId } = req.body;

  if (!description || !startDate || !endDate || !shiftId) {
    return next(sendError(422, "Please enter all required fields."));
  }

  if (req.user.type === USER_TYPE.WORKER) {
    return next(sendError(502, "User not authorized!"));
  }

    try {

      const requiredShift = await Shift.findById(shiftId);
    if (requiredShift) {

      const updatedShift = await Shift.updateOne(
        {
          _id: shiftId,
        },
        {
          $set: {
            description,
            startDate,
            endDate
          },
        }
      );

      if(updatedShift){
        return res.status(201).json({
          message: "Shift updated!",
          data: updatedShift,
        });
      }
      next(sendError(422, `This shift can't be updated!`));
    }else{
      next(sendError(422, `This shift can't be updated!`));
    }
    } catch (error) {
      console.log("ERROR", error);
      next(sendError(500, "Something went wrong!"));
    }
 
};

exports.confirmShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (!shiftId) {
    return next(sendError(422, "Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502, "User not authorized!"));
  }

  try {
    const requiredShift = await Shift.findById(shiftId);
    if (requiredShift) {

    const allShifts = await Shift.find({
      $and: [
        {
          confirmedBy: { $eq: req.user._id },
        },
        { status: { $eq: SHIFT_STATUS.CONFIRMED } },
      ],
    });
  
    const filterShifts = allShifts.find((e) => {
      const SStartTime = Number(
        Math.floor(requiredShift.startDate - e.startDate) / 36e5
      );
      const SEndTime = Number(
        Math.floor(requiredShift.startDate - e.endDate) / 36e5
      );

      const EStartTime = Number(
        Math.floor(requiredShift.endDate - e.startDate) / 36e5
      );
      const EEndTime = Number(
        Math.floor(requiredShift.endDate - e.endDate) / 36e5
      );

      if (
        (SStartTime > 0 && SEndTime < 0) ||
        (EStartTime > 0 && EEndTime < 0)
      ) {
        return true;
      }
      return false;
    });

    if (filterShifts) {
      return next(
        sendError(422, `You already got a shift between this time frame.`)
      );
    }

   
      let obj = {
        status: SHIFT_STATUS.CONFIRMED,
        confirmedBy: req.user._id,
      };

      const confirmShift = await Shift.updateOne(
        {
          _id: shiftId,
          status: { $eq: SHIFT_STATUS.NOT_ASSIGNED } ,
         
        },
        {
          $set: obj,
        }
      );

      res.status(200).json({
        message: "Shift confirmed!",
        data: confirmShift,
      });
    } else {
      next(sendError(422, `This shift can't be confirmed!`));
    }
  } catch (error) {
    console.log("CONFIRM SHIFT ERROR", error);
    next(sendError(422, `This shift can't be confirmed!`));
  }
};

exports.cancelShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (!shiftId) {
    return next(sendError(422, "Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502, "User not authorized!"));
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.floor(requiredShift.startDate - new Date()) / 36e5
      );

      if (diffTime <= 4) {
        return next(
          sendError(
            422,
            `You can only cancel shift brfore 4 hours of it's starting time.`
          )
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
    } else {
      next(sendError(422, `This shift can't be cancelled!`));
    }
  } catch (error) {
    console.log("CANCEL SHIFT ERROR", error);
    next(sendError(422, `This shift can't be cancelled!`));
  }
};

exports.swapShift = async (req, res, next) => {
  const { shiftId, workerId } = req.body;

  if (!shiftId || !workerId) {
    return next(sendError(422, "Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502, "User not authorized!"));
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.floor(requiredShift.startDate - new Date()) / 36e5
      );

      if (diffTime <= 4) {
        return next(
          sendError(
            422,
            `You can only swap shift before 4 hours of it's starting time.`
          )
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
            swappedTo: workerId
          },
        }
      );

      res.status(200).json({
        message: "Shift set to swap!",
        data: swapShift,
      });
    } else {
      next(sendError(422, `This shift can't be swapped!`));
    }
  } catch (error) {
    console.log("SWAP SHIFT ERROR", error);
    next(sendError(422, `This shift can't be swapped!`));
  }
};

exports.completeShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if (!shiftId) {
    return next(sendError(422, "Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502, "User not authorized!"));
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      // Login to calculate time difference in hours
      const diffTime = Number(
        Math.floor(new Date() - requiredShift.endDate) / 36e5
      );

      if (diffTime <= 0) {
        return next(
          sendError(
            422,
            `You can't complete your shift before shift ending timings.`
          )
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
        message: "Shift completed!",
        data: completeShift,
      });
    } else {
      next(sendError(422, `This shift can't be completed!`));
    }
  } catch (error) {
    console.log("CANCEL SHIFT ERROR", error);
    next(sendError(422, `This shift can't be completed!`));
  }
};

exports.swapResponse = async(req, res, next) => {
  const { shiftId, isAccepted } = req.body;

  if (!shiftId) {
    return next(sendError(422, "Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502, "User not authorized!"));
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if(requiredShift){

    let obj = {};

    if(isAccepted){
      obj = {
        swappedFrom: requiredShift.confirmedBy,
        confirmedBy: req.user._id,
        swappedTo: null,
        status: SHIFT_STATUS.CONFIRMED
      };

      const allShifts = await Shift.find({
        $and: [
          {
            confirmedBy: { $eq: req.user._id },
          },
          { status: { $eq: SHIFT_STATUS.CONFIRMED } },
        ],
      });
    
      const filterShifts = allShifts.find((e) => {
        const SStartTime = Number(
          Math.floor(requiredShift.startDate - e.startDate) / 36e5
        );
        const SEndTime = Number(
          Math.floor(requiredShift.startDate - e.endDate) / 36e5
        );
  
        const EStartTime = Number(
          Math.floor(requiredShift.endDate - e.startDate) / 36e5
        );
        const EEndTime = Number(
          Math.floor(requiredShift.endDate - e.endDate) / 36e5
        );
  
        if (
          (SStartTime > 0 && SEndTime < 0) ||
          (EStartTime > 0 && EEndTime < 0)
        ) {
          return true;
        }
        return false;
      });
  
      if (filterShifts) {
        return next(
          sendError(422, `You already got a shift between this time frame.`)
        );
      }

    }else{
      obj = {
        swappedFrom: null,
        swappedTo: null,
        status: SHIFT_STATUS.CONFIRMED
      };
    }

    const confirmShift = await Shift.updateOne(
      {
        _id: shiftId,
        status: SHIFT_STATUS.SWAP,
        swappedTo: req.user._id,
      },
     obj
    );

    res.status(200).json({
      message: "Success!",
      data: confirmShift,
    });

  }else{
    next(sendError(422,'Can not swap shift.'))
  }

  } catch (error) {
    console.log('SWAP ERROR', error);
    next(sendError(500, "Something went wrong!"));
  }
}

exports.getshifts = async (req, res, next) => {
  const { status } = req.query;

  let keyword = {};

  if( status === SHIFT_STATUS.SWAP ){
    keyword = {  $and: [
      {
        $or: [
          { swappedTo: { $eq: req.user._id } },
          { confirmedBy: { $eq: req.user._id } },
          { createdBy: { $eq: req.user._id } },
        ],
      },
      { status: { $eq: status } },
    ], };
  }else if (
    status === SHIFT_STATUS.NOT_ASSIGNED && req.user.type === USER_TYPE.WORKER
  ) {
    keyword = { status: { $eq: status } };
  } else if (status) {
    keyword = {
      $and: [
        {
          $or: [
            { createdBy: { $eq: req.user._id } },
            { confirmedBy: { $eq: req.user._id } },
          ],
        },
        { status: { $eq: status } },
      ],
    };
  }

  try {
  
    const shifts = await Shift.find(keyword)
      .populate("confirmedBy", "-password")
      .populate("createdBy", "-password")
      .populate("swappedFrom", "-password")
      .populate("swappedTo", "-password");

    res.status(200).json({
      message: "Shifts fetched!",
      data: shifts,
    });
  } catch (error) {
    console.log("ERROR", error);
    next(sendError(500, "Something went wrong!"));
  }
};
