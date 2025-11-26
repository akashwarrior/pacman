import axios from "axios";
import { socketManager } from "./socket";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

export async function createRoom(name: string, color: string): Promise<number | null> {
  try {
    const { data } = await api.post<{ playerId: number; roomId: number }>("/api/rooms/create", { Name: name, Color: color });
    socketManager.connect(data.roomId, data.playerId);
    return data.roomId;
  } catch {
    return null;
  }
}

export async function joinRoom(name: string, color: string, roomId: number): Promise<number | null> {
  try {
    const { data } = await api.post<{ playerId: number; roomId: number }>(`/api/rooms/join?roomId=${roomId}`, { Name: name, Color: color });
    socketManager.connect(roomId, data.playerId);
    return roomId;
  } catch {
    return null;
  }
}

export function leaveRoom() {
  socketManager.disconnect();
}

export function setReady(isReady: boolean) {
  socketManager.send("Ready", { isReady });
}

export function startGame() {
  socketManager.send("Start", {});
}

export function kickPlayer(playerId: number) {
  socketManager.send("Kick", {}, playerId);
}

