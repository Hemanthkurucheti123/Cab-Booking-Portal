const { Server } = require("socket.io");

let io = null;

function initSocket(httpServer, frontendUrl) {
  io = new Server(httpServer, {
    cors: { origin: frontendUrl },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("join", (userId) => socket.join(userId));
    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };