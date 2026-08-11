const { getChannel } = require("./rabbitmq");
const { getIO } = require("../sockets/socketServer");
const pool = require("../db");

async function startConsumers() {
  const channel = getChannel();

  // when a new booking is published, find associated vendors and notify them
  channel.consume("new_bookings", async (msg) => {
    if (msg === null) return;
    const booking = JSON.parse(msg.content.toString());

    const result = await pool.query(
      `SELECT vendor_id FROM company_vendor_map WHERE company_id = $1 AND is_associated = true`,
      [booking.company_id]
    );

    const io = getIO();
    result.rows.forEach((row) => {
      io.to(row.vendor_id).emit("new_booking_request", booking);
    });

    channel.ack(msg); // tells RabbitMQ "I successfully handled this, remove it"
  });

  // when a booking's status changes, notify the company that owns it
  channel.consume("booking_status_updates", (msg) => {
    if (msg === null) return;
    const booking = JSON.parse(msg.content.toString());

    const io = getIO();
    io.to(booking.company_id).emit("booking_status_changed", booking);

    channel.ack(msg);
  });

  console.log("RabbitMQ consumers started");
}

module.exports = { startConsumers };