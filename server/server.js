const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use("uploads/recordings", express.static("uploads/recordings"))
app.use("uploads/images", express.static("uploads/images"))

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "clinet", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// const PORT = process.env.PORT;
const PORT = 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

global.onlineUsers = new Map();  // map data structure

// const io = require("socket.io")(server, {
//   pingTimeout: 60000, // if no user is connected till 60s then it will turn of to save bandwidth
//   cors: {
//     origin: "http://localhost:3000",
//     // credentials: true,
//   },
// });

const io = new Server(server,{
  cors: {
        origin: "http://localhost:3000",
        // credentials: true,
      },
})

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
 
  global.chatSocket = socket;
  socket.on("add-user" , (userId)=>{
    onlineUsers.set(userId,socket.id)
  })

  socket.on("send-msg" , (data)=>{
    const sendUserSocket = onlineUsers.get(data.to)
    console.log(sendUserSocket)
    if(sendUserSocket){
        socket.to(sendUserSocket).emit("msg-received",{
          sender:data.from,
          content:data.content,
          chatId: data.chatId,
          chatType:data.chatType,
          createdAt:data.createdAt,
          messageStatus:data.messageStatus,
        })
    }
  })
});
