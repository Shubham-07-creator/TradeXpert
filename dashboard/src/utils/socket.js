import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

// One shared socket connection for the whole dashboard app. Every
// component that needs live market data subscribes through
// utils/liveMarket.js rather than creating its own socket.
export const socket = io(API, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});