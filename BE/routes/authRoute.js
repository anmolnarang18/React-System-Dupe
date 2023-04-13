const express = require("express");

const authController = require("../controllers/authController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// POST /auth/login
router.post("/login", authController.login);

//POST => /auth/createUser
router.post("/createUser", authController.createUser);

//GET => /auth/fetchWorkers
router.get("/fetchWorkers", isAuth, authController.fetchWorkers);

module.exports = router;
