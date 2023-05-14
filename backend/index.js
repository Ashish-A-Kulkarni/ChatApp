const express = require("express");
const {chats} = require("./data/data")
const dotenv = require("dotenv");
const res = require("express/lib/response");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")
const chatRoutes =require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes");

const cors = require('cors');
dotenv.config()
const app = express();
connectDB();
app.use(cors({origin: '*'}));

app.use(express.json());

app.get("/",(req,res) => {
    res.send("Home Page CHAT APP");
});

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
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket.io "+socket);

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined the room: " + room);
    });

    socket.on("newmessage", (newMessageReceived) => {
        console.log("inside new message room "+newMessageReceived.sender.name);
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat users not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;
            console.log("inside new message room emit "+newMessageReceived.sender.name)
            socket.in(user._id).emit("message Received",newMessageReceived)
        })
    })
});