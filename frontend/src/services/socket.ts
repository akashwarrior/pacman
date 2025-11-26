import { Message } from "@/types/message";

type EventHandler = (payload: Record<string, unknown>, playerId?: number) => void;

class SocketManager {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, EventHandler>();
  private pendingMessages: { event: string; payload: Record<string, unknown>; id?: number }[] = [];
  private _playerId: number | null = null;
  private _roomId: number | null = null;

  get playerId() {
    return this._playerId;
  }

  get roomId() {
    return this._roomId;
  }

  connect(roomId: number, playerId: number) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return;

    this._roomId = roomId;
    this._playerId = playerId;
    this.pendingMessages = [];

    this.socket = new WebSocket(`${wsUrl}?roomId=${roomId}&playerId=${playerId}`);
    this.socket.binaryType = "arraybuffer";

    this.socket.onmessage = (event) => {
      try {
        const message = Message.decode(new Uint8Array(event.data));
        const payload = message.payload as unknown as Record<string, unknown>;


        const handler = this.handlers.get(message.event);
        if (handler) {
          handler(payload, message.id);
        } else {
          this.pendingMessages.push({ event: message.event, payload, id: message.id });
        }
      } catch (e) {
        console.error("Failed to decode message:", e);
      }
    };

    this.socket.onerror = (e) => console.error("WebSocket error:", e);
    this.socket.onclose = () => console.log("WebSocket closed");
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this._playerId = null;
    this._roomId = null;
    this.handlers.clear();
    this.pendingMessages = [];
  }

  send(event: string, payload: Record<string, unknown>, id?: number) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const message = Message.encode({
      id: id ?? this._playerId ?? undefined,
      event,
      time: Date.now(),
      payload: { ...payload, players: [] },
    }).finish();

    this.socket.send(message);
  }

  on(event: string, handler: EventHandler) {
    this.handlers.set(event, handler);

    const pending = this.pendingMessages.filter(m => m.event === event);
    for (const msg of pending) {
      handler(msg.payload, msg.id);
    }
    this.pendingMessages = this.pendingMessages.filter(m => m.event !== event);
  }

  off(event: string) {
    this.handlers.delete(event);
  }
}

export const socketManager = new SocketManager();
