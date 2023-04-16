const Shift = require("../models/shiftModel");
const sendError = require("../utils/sendError");

const { USER_TYPE, SHIFT_STATUS } = require("../shared/constants");

exports.createShift = async (req, res, next) => {
  const { description, startDate, endDate, createdBy } = req.body;

  if (!description || !startDate || !endDate  || !createdBy) {
    return next(sendError(422,"Please enter all required fields."));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    try {
      const newShift = await Shift.create({
        description,
        startDate,
        endDate,
        createdBy,
        status: SHIFT_STATUS.NOT_ASSIGNED,
      });

      res.status(201).json({
        message: "Shift created!",
        data: newShift,
      });
    } catch (error) {
      console.log("ERROR", error);
      next(sendError(500,"Something went wrong!"));
    }
  } else {
    next(sendError(422,"You are not authorized to create a shift."));
  }
};

exports.confirmShift = async (req, res, next) => {
  const { shiftId } = req.body;
  
  if(!shiftId){
    return next(sendError(422,"Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502,"User not authorized!"))
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
      }
    
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
    }else{
      next(sendError(422,`This shift can't be cancelled!`))
    }
  } catch (error) {
    console.log("CONFIRM SHIFT ERROR", error);
    next(sendError(422,`This shift can't be confirmed!`));
  }
};

exports.cancelShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if(!shiftId){
    return next(sendError(422,"Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502,"User not authorized!"))
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.abs(requiredShift.startDate - new Date()) / 36e5
      );

      if (diffTime <= 4) {
        return next(sendError(422,`You can only cancel shift brfore 4 hours of it's starting time.`))
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
    }else{
      next(sendError(422,`This shift can't be cancelled!`))
    }
  } catch (error) {
    console.log("CANCEL SHIFT ERROR", error);
    next(sendError(422,`This shift can't be cancelled!`))
  }
};

exports.swapShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if(!shiftId){
    return next(sendError(422,"Invalid data sent!"));
  }


  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502,"User not authorized!"));
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      const diffTime = Number(
        Math.abs(requiredShift.startDate - new Date()) / 36e5
      );

      if (diffTime <= 4) {
        return next(sendError(422, `You can only swap shift before 4 hours of it's starting time.`))
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
    }else{
      next(sendError(422,`This shift can't be swapped!`));
    }
  } catch (error) {
    console.log("SWAP SHIFT ERROR", error);
    next(sendError(422,`This shift can't be swapped!`));
  }
};

exports.completeShift = async (req, res, next) => {
  const { shiftId } = req.body;

  if(!shiftId){
    return next(sendError(422,"Invalid data sent!"));
  }

  if (req.user.type === USER_TYPE.MANAGER) {
    return next(sendError(502,"User not authorized!"));
   
  }

  try {
    const requiredShift = await Shift.findById(shiftId);

    if (requiredShift) {
      // Login to calculate time difference in hours
      const diffTime = Number(
        Math.abs(new Date() - requiredShift.endDate) / 36e5
      );

      if (diffTime <= 0) {
        return next(sendError(422, `You can't complete your shift during shift timings.`))
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
    }else{
      next(sendError(422,`This shift can't be completed!`))
    }
  } catch (error) {
    console.log("CANCEL SHIFT ERROR", error);
    next(sendError(422,`This shift can't be completed!`))
  }
};

exports.getshifts = async (req, res, next) => {
  const { status } = req.query;

  

  let keyword = {};

  if(status === SHIFT_STATUS.SWAP || (status === SHIFT_STATUS.NOT_ASSIGNED && req.user.type === USER_TYPE.WORKER)){
    keyword = { status: { $eq: status } };
  }else if(status){
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
    }
  }

  try {
    // const keyword = status === SHIFT_STATUS.SWAP?{ status: { $eq: status } }:status
    //   ? {
    //       $and: [
    //         {
    //           $or: [
    //             { createdBy: { $eq: req.user._id } },
    //             { confirmedBy: { $eq: req.user._id } },
    //           ],
    //         },
    //         { status: { $eq: status } },
    //       ],
    //     }
    //   : {};
      
    const shifts = await Shift.find(keyword)
      .populate("confirmedBy", "-password")
      .populate("createdBy", "-password")
      .populate("swappedFrom", "-password");

    res.status(200).json({
      message: "Shifts fetched!",
      data: shifts,
    });
  } catch (error) {
    console.log("ERROR", error);
    next(sendError(500,'Something went wrong!'))
  }
};


