import axios from "axios";
import { getBackendApiUrl } from "@/lib/env";
import { socketManager } from "./socket-manager";

interface RoomSessionResponse {
  playerId: number;
  roomId: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export type RoomActionResult =
  | { ok: true; roomId: number }
  | { ok: false; message: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const status = error.response?.status;
  const responseMessage =
    error.response?.data?.message?.trim() || error.response?.data?.error?.trim();

  if (responseMessage) {
    return responseMessage;
  }

  if (status === 404) {
    return "Room not found.";
  }

  if (status === 409) {
    return "Room is full.";
  }

  if (status === 408 || error.code === "ECONNABORTED") {
    return "Backend timed out. Please try again.";
  }

  return fallback;
}

async function connectToRoom(
  path: string,
  payload: { Name: string; Color: string },
  fallbackErrorMessage: string,
): Promise<RoomActionResult> {
  const baseURL = getBackendApiUrl();

  if (!baseURL) {
    return {
      ok: false,
      message:
        "Backend endpoint is not configured. Set NEXT_PUBLIC_BACKEND_URL to a valid http:// or https:// URL.",
    };
  }

  const apiClient = axios.create({
    baseURL,
    timeout: 10_000,
  });

  try {
    const { data } = await apiClient.post<RoomSessionResponse>(path, payload);

    const connection = socketManager.connect(data.roomId, data.playerId);
    if (!connection.ok) {
      return {
        ok: false,
        message: connection.error ?? "Could not establish realtime connection.",
      };
    }

    return { ok: true, roomId: data.roomId };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, fallbackErrorMessage),
    };
  }
}

export function createRoom(name: string, color: string): Promise<RoomActionResult> {
  return connectToRoom(
    "/api/rooms/create",
    { Name: name, Color: color },
    "Failed to create room.",
  );
}

export function joinRoom(
  name: string,
  color: string,
  roomId: number,
): Promise<RoomActionResult> {
  const searchParams = new URLSearchParams({ roomId: roomId.toString() });

  return connectToRoom(
    `/api/rooms/join?${searchParams.toString()}`,
    { Name: name, Color: color },
    "Failed to join room.",
  );
}

export function leaveRoom(): void {
  socketManager.disconnect();
}

export function setReady(isReady: boolean): void {
  socketManager.send("Ready", { isReady });
}

export function startGame(): void {
  socketManager.send("Start", {});
}

export function kickPlayer(playerId: number): void {
  socketManager.send("Kick", {}, playerId);
}
