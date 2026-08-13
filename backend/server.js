const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");

const { connectRabbitMQ } = require("./queue/rabbitmq");
const { startConsumers } = require("./queue/consumer");
const { initSocket } = require("./sockets/socketServer");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);

const httpServer = http.createServer(app);
initSocket(httpServer, FRONTEND_URL);

async function start() {
  await connectRabbitMQ();
  await startConsumers();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();