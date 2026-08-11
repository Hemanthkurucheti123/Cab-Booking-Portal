const { Server } = require("socket.io");

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*" }, // fine for local dev; tighten this for production
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // vendors/companies join a "room" named after their own user id,
    // so we can send updates to exactly the right person
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };