const express = require("express");

const isAuth = require("../middleware/isAuth");
const shiftController = require("../controllers/shiftController");

const router = express.Router();

// Post shift/createShift
router.post("/createShift", isAuth, shiftController.createShift);

// PUT shift/confirmShift
router.put("/confirmShift", isAuth, shiftController.confirmShift);

// PUT shift/swapShift
router.put("/swapShift", isAuth, shiftController.swapShift);

// PUT shift/cancelShift
router.put("/cancelShift", isAuth, shiftController.cancelShift);

// GET shift/getShifts
router.get("/getshifts", isAuth, shiftController.getshifts);

module.exports = router;
