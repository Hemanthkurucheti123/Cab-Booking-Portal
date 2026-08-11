const amqp = require("amqplib");

let channel = null;

async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://localhost:5672");
  channel = await connection.createChannel();

  // Declare the queues we'll use — "durable: true" means messages survive
  // a RabbitMQ restart (won't get lost if the server reboots)
  await channel.assertQueue("new_bookings", { durable: true });
  await channel.assertQueue("booking_status_updates", { durable: true });

  console.log("Connected to RabbitMQ");
  return channel;
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized yet");
  }
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };