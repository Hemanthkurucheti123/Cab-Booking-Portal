const { getChannel } = require("./rabbitmq");

function publishNewBooking(booking) {
  const channel = getChannel();
  channel.sendToQueue(
    "new_bookings",
    Buffer.from(JSON.stringify(booking)),
    { persistent: true }
  );
}

function publishStatusUpdate(booking) {
  const channel = getChannel();
  channel.sendToQueue(
    "booking_status_updates",
    Buffer.from(JSON.stringify(booking)),
    { persistent: true }
  );
}

module.exports = { publishNewBooking, publishStatusUpdate };