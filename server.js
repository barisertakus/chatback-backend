const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");
const Message = require("./models/Message");
const rooms = ["general", "technology", "business"];
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);
require("./connection");

const server = require("http").createServer(app);
const PORT = process.env.PORT || 4000;
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "https://chatback-neon.vercel.app"],
    methods: ["GET", "POST"],
  },
});

app.get("/rooms", (req, res) => {
  res.json(rooms);
});

const getLastMessagesFromRoom = async (room) => {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
};

const sortRoomMessagesByDate = (messages) => {
  return messages.sort((a, b) => {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
};

io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    const members = await User.find();
    io.emit("new-user", members);
  });

  socket.on("join-room", async (room, previousRoom) => {
    socket.join(room);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit("room-messages", roomMessages);
  });

  socket.on("message-room", async (room, sender, time, date, content) => {
    const message = await Message.create({
      content,
      time,
      date,
      from: sender,
      to: room,
    });

    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);

    io.to(room).emit("room-messages", roomMessages);

    const notificationMessage = {
      room,
      content,
      from : sender.name,
    }
    socket.broadcast.emit("notifications", notificationMessage);
  });

  app.delete("/logout", async (req, res) => {
    try {
      const { _id, newMessages } = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit("new-user", members);
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(400).send();
    }
  });
});

server.listen(PORT, () => {
  console.log("Server is working. Port:", PORT);
});
