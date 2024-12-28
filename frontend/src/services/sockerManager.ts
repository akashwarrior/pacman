import { Payload, Message } from "@/types/message";
import { roomManager } from "@/services/roomManager";

class SocketManager {
  private socket: WebSocket | null = null;
  private static instance: SocketManager;
  private eventListeners: { [event: string]: (data: Payload, ID?: number) => void } = {};
  private missedEvents: { [event: string]: Message } = {};
  // private timeTook: number = 0;

  private constructor() { }

  public static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public connect(roomId: number): void {
    if (this.socket !== null) {
      this.socket.close();
      this.socket = null;
    }

    this.socket = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_BACKEND_URL}/play?playerId=${roomManager.PlayerId}&roomId=${roomId}`
    );

    this.socket.binaryType = "arraybuffer";

    this.socket.onmessage = (event) => {
      let data: Message;
      try {
        // const now = new Date().getTime();
        data = Message.decode(new Uint8Array(event.data));
        // if (data.time) {
        //   const timeTook = now - (data.time as number);
        //   this.timeTook = Math.max(this.timeTook, timeTook);
        //   console.log("Time took:", timeTook);
        // }
        // console.log("Max time took:", this.timeTook);
      } catch (error) {
        console.log("Failed to parse message:", error);
        return;
      }
      if (this.eventListeners[data.event]) {
        this.eventListeners[data.event](data.payload!, data.id!);
      } else {
        this.missedEvents[data.event] = data;
      }
    }

    this.socket.onclose = () => {
      this.socket = null;
      roomManager.PlayerId = null;
      this.eventListeners = {};
      this.missedEvents = {};
    };
  }

  public subscribe(event: string, callback: (data: Payload, ID?: number) => void): void {
    this.eventListeners[event] = callback;
    if (this.missedEvents[event]) {
      callback(this.missedEvents[event].payload!, this.missedEvents[event].id!);
      delete this.missedEvents[event];
    }
  }

  public unsubscribe(event: string): void {
    delete this.eventListeners[event];
  }

  public send(event: string, payload: Partial<Payload>, id?: number): void {
    if (!this.socket) return;
    const time = new Date().getTime();
    const buffer = Message.encode({ event, time, id, payload: { ...payload, players: [] } }).finish();
    this.socket.send(buffer);
  }

  public disconnect() {
    this.eventListeners = {};
    this.missedEvents = {};
    if (!this.socket) return;
    this.socket.onmessage = null;
    this.socket.close();
    this.socket = null;
  }
}

export const socketManager = SocketManager.getInstance();