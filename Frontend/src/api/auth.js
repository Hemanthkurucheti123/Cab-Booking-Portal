import client from "./client";

export function signup(data) {
  return client.post("/auth/signup", data);
}

export function login(data) {
  return client.post("/auth/login", data);
}