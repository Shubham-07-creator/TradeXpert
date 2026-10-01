import { io } from "socket.io-client";
import { API } from "./auth";

// One shared socket connection for the whole dashboard app. Every
// component that needs live market data subscribes through
// utils/liveMarket.js rather than creating its own socket.
export const socket = io(API, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});