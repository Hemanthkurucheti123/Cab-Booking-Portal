import client from "./client";

export function createBooking(data) {
  return client.post("/bookings", data);
}

export function getBookings() {
  return client.get("/bookings");
}