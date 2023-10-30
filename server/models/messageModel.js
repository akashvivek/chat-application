const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    // receiver: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chatType:{
      type:String,
      default:"text"
    },
    messageStatus:{
      type:String,
      default:"sent"
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
