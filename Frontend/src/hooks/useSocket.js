import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket(userId, onEvent) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    socket.on("booking_status_changed", (booking) => {
      onEvent(booking);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, onEvent]);
}