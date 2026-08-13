const amqp = require("amqplib");
require("dotenv").config();

let channel = null;

async function connectRabbitMQ() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

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