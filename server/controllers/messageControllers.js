const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const {renameSync}= require("fs")


const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name profileImage email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, sender } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: sender,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name ProfileImage").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name ProfileImage email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const addMessage = asyncHandler(async (req, res) => {
  const { content, chatId, from  , to  } = req.body;

  if (!content || !chatId || !from || !to) {
    console.log("Invalid data passed into request");
    return res.status(400).json({
      message: "Invalid data passed into request",
      success: false,
  })
  }

  const getUser = onlineUsers.get(to);


  var newMessage = {
    sender: from,
    content: content,
    chat: chatId,
    receiver:to,
    messageStatus:getUser ? "delivered" : "sent"
  };

  try {
    var messages = await Message.create(newMessage);

    return res.status(201).json({
      message: "message sent",
      success: true,
      data : messages
  })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
  })
  }
});

const getMessages = asyncHandler(async (req, res) => {
  try {
    var messages = await Message.find({ chat: req.params.chatId })
    const unreadMessages=[];
    messages.forEach((message,index)=>{
      if(message.messageStatus!=="read" && message.sender?.toString()===req.params.to){
        messages[index].messageStatus="read";
        unreadMessages.push(message._id)
      }
    })
  await Message.updateMany({
      "_id":{$in:unreadMessages}
    },
    {"$set":{
      "messageStatus":"read"
  }
  })
    messages = await Message.find({ chat: req.params.chatId })
    return res.status(200).json({
      message: "messages",
      success: true,
      messages : messages
  })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message : error.message
  })
  }
});


const addImageMessage = asyncHandler(async (req, res) => {
  const {  chatId, from  , to  } = req.body;

  if (!chatId || !from || !to) {
    console.log("Invalid data passed into request");
    return res.status(400).json({
      message: "Invalid data passed into request",
      success: false,
  })
  }

  const getUser = onlineUsers.get(to);

  try {
    if(req.file){
      const date = Date.now();
      let filename = "uploads/images/"+date+req.file.originalname
      renameSync(req.file.path,filename);
      var newMessage = {
        sender: from,
        content: filename,
        chatType:"image",
        chat: chatId,
        receiver:to,
        messageStatus:getUser ? "delivered" : "sent"
      };
      var messages = await Message.create(newMessage);
  
      return res.status(201).json({
        message: "message sent",
        success: true,
        data : messages
    })
    }
   
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
  })
  }
});
const addAudioMessage = asyncHandler(async (req, res) => {
  const {  chatId, from  , to  } = req.body;

  if (!chatId || !from || !to) {
    console.log("Invalid data passed into request");
    return res.status(400).json({
      message: "Invalid data passed into request",
      success: false,
  })
  }

  const getUser = onlineUsers.get(to);

  try {
    if(req.file){
      const date = Date.now();
      let filename = "uploads/recordings/"+date+req.file.originalname
      renameSync(req.file.path,filename);
      var newMessage = {
        sender: from,
        content: filename,
        chatType:"audio",
        chat: chatId,
        receiver:to,
        messageStatus:getUser ? "delivered" : "sent"
      };
      var messages = await Message.create(newMessage);
  
      return res.status(201).json({
        message: "message sent",
        success: true,
        data : messages
    })
    }
   
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
  })
  }
});

const getContacts = asyncHandler(async (req, res) => {
  const from = req.params.from;

  if (!from) {
    return res.status(400).json({
      message: "Invalid user",
      success: false,
  })
  }


  try {
    
    const userExists = await User.findById({_id:from });
      return res.status(201).json({
        message: "message sent",
        success: true,
    })
    
   
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
  })
  }
});

module.exports = { allMessages, sendMessage ,addMessage ,getMessages,addImageMessage,addAudioMessage,getContacts};
