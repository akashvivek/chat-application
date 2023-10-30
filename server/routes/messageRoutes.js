const express = require("express");
const {
  allMessages,
  sendMessage,
  addMessage,
  getMessages,
  addImageMessage,
  addAudioMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer")

const router = express.Router();

const upload = multer({dest: "uploads/images"})
const uploadAudio = multer({dest: "uploads/recordings"})

// router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);


router.route("/add-message").post(addMessage);
router.route("/get-message/:chatId/:to").get(getMessages);
router.route("/add-image-message").post(upload.single("image"),addImageMessage)
router.route("/add-audio-message").post(uploadAudio.single("audio"),addAudioMessage)

module.exports = router;
