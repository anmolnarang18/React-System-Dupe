const express = require("express");

const isAuth = require("../middleware/isAuth");
const shiftController = require("../controllers/shiftController");

const router = express.Router();

// Post shift/createShift
router.post("/createShift", isAuth, shiftController.createShift);

// PUT shift/confirmShift
router.post("/confirmShift", isAuth, shiftController.confirmShift);

// PUT shift/completeShift
router.post("/completeShift", isAuth, shiftController.completeShift);

// PUT shift/swapShift
router.post("/swapShift", isAuth, shiftController.swapShift);

// PUT shift/cancelShift
router.post("/cancelShift", isAuth, shiftController.cancelShift);

// PUT shift/swapResponse
router.post("/swapResponse", isAuth, shiftController.swapResponse);

// PUT shift/updateShift
router.put("/updateShift", isAuth, shiftController.updateShift);

// GET shift/getShifts
router.get("/getshifts", isAuth, shiftController.getshifts);

module.exports = router;
