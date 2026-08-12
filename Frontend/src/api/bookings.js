import client from "./client";

export function createBooking(data) {
  return client.post("/bookings", data);
}

export function getBookings() {
  return client.get("/bookings");
}

export function acceptBooking(id, data) {
  return client.patch(`/bookings/${id}/accept`, data);
}

export function rejectBooking(id) {
  return client.patch(`/bookings/${id}/reject`, {});
}

export function placeInOpenMarket(id) {
  return client.patch(`/bookings/${id}/open-market`, {});
}

export function startTrip(id) {
  return client.patch(`/bookings/${id}/start-trip`, {});
}

export function endTrip(id) {
  return client.patch(`/bookings/${id}/end-trip`, {});
}