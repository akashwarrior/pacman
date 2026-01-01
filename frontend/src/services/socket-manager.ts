import { MAP } from "@/lib/constants/game";
import { getWebSocketUrl } from "@/lib/env";
import type {
  PendingEvent,
  SocketConnectionListener,
  SocketConnectionState,
  SocketEventHandler,
  SocketEventName,
  SocketEventPayloads,
} from "@/types";
import { Message, type Payload } from "@/types/message";

const SOCKET_EVENTS: readonly SocketEventName[] = [
  "Join",
  "Ready",
  "Start",
  "Spawn",
  "Move",
  "Shoot",
  "Hit",
  "Kick",
  "Kills",
];

const MAX_PENDING_OUTBOUND_MESSAGES = 100;

function isSocketEventName(event: string): event is SocketEventName {
  return SOCKET_EVENTS.includes(event as SocketEventName);
}

function isBlobValue(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

interface SocketConnectResult {
  ok: boolean;
  error?: string;
}

class SocketManager {
  private socket: WebSocket | null = null;
  private handlers = new Map<SocketEventName, Set<SocketEventHandler>>();
  private pendingOutgoingMessages: Uint8Array[] = [];
  private connectionListeners = new Set<SocketConnectionListener>();
  private _playerId: number | null = null;
  private _roomId: number | null = null;
  private _connectionState: SocketConnectionState = { status: "idle" };
  private pendingEvents: Partial<Record<SocketEventName, PendingEvent>> = {};

  get playerId(): number | null {
    return this._playerId;
  }

  get roomId(): number | null {
    return this._roomId;
  }

  get connectionState(): SocketConnectionState {
    return this._connectionState;
  }

  connect(roomId: number, playerId: number): SocketConnectResult {
    const wsUrl = getWebSocketUrl();
    if (!wsUrl) {
      const error =
        "Realtime endpoint is not configured. Set NEXT_PUBLIC_WS_URL to a valid ws:// or wss:// URL.";
      this._playerId = null;
      this._roomId = null;
      this.setConnectionState({ status: "error", reason: error });
      return { ok: false, error };
    }

    this.closeSocket();
    this.pendingEvents = {};
    this._roomId = roomId;
    this._playerId = playerId;
    this.pendingOutgoingMessages = [];

    let socket: WebSocket;

    try {
      socket = new WebSocket(`${wsUrl}?roomId=${roomId}&playerId=${playerId}`);
    } catch {
      const error = "Failed to initialize realtime connection. Check NEXT_PUBLIC_WS_URL.";
      this._playerId = null;
      this._roomId = null;
      this.setConnectionState({ status: "error", reason: error });
      return { ok: false, error };
    }

    this.setConnectionState({ status: "connecting" });

    socket.binaryType = "arraybuffer";
    socket.onmessage = this.handleMessageData.bind(this);

    socket.onopen = () => {
      this.setConnectionState({ status: "connected" });
      this.flushPendingOutgoingMessages();
    };

    socket.onerror = () => {
      this.setConnectionState({
        status: "error",
        reason: "Realtime connection hit a network error.",
      });
    };

    socket.onclose = (event) => {
      if (this.socket !== socket) return;

      this.socket = null;
      this._playerId = null;
      this._roomId = null;

      const reason = event.reason?.trim()
        ? event.reason
        : event.wasClean
          ? "Realtime connection closed."
          : "Realtime connection dropped unexpectedly.";

      this.setConnectionState({ status: "disconnected", reason });
    };

    this.socket = socket;
    return { ok: true };
  }

  disconnect(): void {
    this.closeSocket();
    this.pendingEvents = {};
    this._playerId = null;
    this._roomId = null;
    this.handlers.clear();
    this.pendingOutgoingMessages = [];
    this.setConnectionState({ status: "idle" });
  }

  send<K extends SocketEventName>(
    event: K,
    payload: Partial<Payload>,
    id?: number,
  ): void {
    const message = Message.encode({
      id: id ?? this._playerId ?? undefined,
      event,
      time: Date.now(),
      payload: { players: [], ...payload },
    }).finish();

    if (!this.socket) return;

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      return;
    }

    if (this.socket.readyState === WebSocket.CONNECTING) {
      this.pendingOutgoingMessages.push(message);
      if (this.pendingOutgoingMessages.length > MAX_PENDING_OUTBOUND_MESSAGES) {
        this.pendingOutgoingMessages.shift();
      }
    }
  }

  onConnectionChange(listener: SocketConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this._connectionState);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  on<K extends SocketEventName>(
    event: K,
    handler: SocketEventHandler<K>,
  ): () => void {
    const listeners = this.handlers.get(event) ?? new Set<SocketEventHandler>();
    listeners.add(handler as SocketEventHandler);
    this.handlers.set(event, listeners);

    const pending = this.pendingEvents[event];
    if (pending) {
      (handler as SocketEventHandler<K>)(
        pending.payload as SocketEventPayloads[K],
        pending.playerId,
      );
    }

    return () => this.off(event, handler);
  }

  off<K extends SocketEventName>(
    event: K,
    handler?: SocketEventHandler<K>,
  ): void {
    if (!handler) {
      this.handlers.delete(event);
      return;
    }

    const listeners = this.handlers.get(event);
    if (!listeners) return;

    listeners.delete(handler as SocketEventHandler);
    if (listeners.size === 0) {
      this.handlers.delete(event);
    }
  }

  private closeSocket(): void {
    if (!this.socket) return;

    this.socket.onclose = null;
    this.socket.onmessage = null;
    this.socket.onerror = null;
    this.socket.onopen = null;
    this.socket.close();
    this.socket = null;
  }

  private setConnectionState(state: SocketConnectionState): void {
    if (
      this._connectionState.status === state.status &&
      this._connectionState.reason === state.reason
    ) {
      return;
    }

    this._connectionState = state;
    this.connectionListeners.forEach((listener) => {
      listener(this._connectionState);
    });
  }

  private flushPendingOutgoingMessages(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    this.pendingOutgoingMessages.forEach((message) => {
      this.socket?.send(message);
    });
    this.pendingOutgoingMessages = [];
  }

  private ingest<K extends SocketEventName>(
    event: K,
    payload: SocketEventPayloads[K],
    playerId?: number,
  ): void {
    (this.pendingEvents as Record<SocketEventName, PendingEvent>)[event] = {
      event,
      payload,
      playerId,
    } as PendingEvent;

    const listeners = this.handlers.get(event);
    if (!listeners) return;

    for (const handler of listeners) {
      (handler as SocketEventHandler<K>)(payload, playerId);
    }
  }

  private async handleMessageData({ data }: MessageEvent<ArrayBuffer>): Promise<void> {
    try {
      const message = Message.decode(new Uint8Array(data));
      if (!isSocketEventName(message.event)) return;

      const raw = (message.payload ?? { players: [] }) as Payload;

      if (message.event === "Spawn") {
        const spawn = {
          players: (raw.players ?? []).map((p) => ({
            ...p,
            position: p.position
              ? { x: p.position.x, y: p.position.y }
              : {
                  x: MAP.WIDTH / 2 + p.id * 12,
                  y: MAP.HEIGHT / 2,
                },
          })),
        } as SocketEventPayloads["Spawn"];
        this.ingest("Spawn", spawn, message.id);
        return;
      }

      this.ingest(
        message.event,
        raw as SocketEventPayloads[typeof message.event],
        message.id,
      );
    } catch (error) {
      console.error("Failed to decode socket message:", error);
    }
  }
}

export const socketManager = new SocketManager();
