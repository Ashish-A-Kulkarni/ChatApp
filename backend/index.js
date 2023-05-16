const express = require("express");
const {chats} = require("./data/data")
const dotenv = require("dotenv");
const res = require("express/lib/response");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")
const chatRoutes =require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes");

const cors = require('cors');
const logger = require("../logger");
dotenv.config()
const app = express();
connectDB();
app.use(cors({origin: '*'}));

app.use(express.json());

app.get("/",(req,res) => {
    res.send("Home Page CHAT APP");
});

//dummy commit
// app.get("/api/chat", (req,res) => {
//     res.send(chats);
// });

// app.get("/api/chat/:id", (req,res) => {
//     const reqchat = chats.find((c) => c._id === req.params.id);
//     res.send(reqchat);
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));
logger.info(`Server started`)
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://172.19.0.2:3000",
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket.io "+socket);
    logger.info("connected to socket.io ");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined the room: " + room);
        logger.info("user joined the room: " + room);
    });

    socket.on("newmessage", (newMessageReceived) => {
        console.log("inside new message room " + newMessageReceived.sender.name);
        logger.info("inside new message room " + newMessageReceived.sender.name);
        var chat = newMessageReceived.chat;

        if (!chat.users) {
            logger.info("chat users not defined");
            return console.log("chat users not defined");
        }
        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;
            console.log("inside new message room emit "+newMessageReceived.sender.name)
            socket.in(user._id).emit("message Received",newMessageReceived)
        })
    })
});