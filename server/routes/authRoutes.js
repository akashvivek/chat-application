const express = require("express");
const { checkUser } = require("../controllers/userControllers");
const { registerUser, getAllUsers } = require("../controllers/authController");

const router = express.Router();

router.route("/check-user").post(checkUser);
router.route("/register-user").post(registerUser);
router.route("/get-contacts").get(getAllUsers);

module.exports = router;
