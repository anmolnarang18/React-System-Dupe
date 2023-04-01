const express = require("express");

const isAuth = require("../middleware/isAuth");
const taskController = require("../controllers/taskController");

const router = express.Router();

// Post task/addTask
router.post("/addTask", isAuth, taskController.addTask);

// PUT task/editTask
router.put("/editTask", isAuth, taskController.editTask);

// GET task/getTasks
router.get("/getTasks", isAuth, taskController.getTasks);

module.exports = router;
