import axios from "axios";
import { socketManager } from "@/services/sockerManager";
import { SOCKET_EVENT } from "@/types";
import { Payload, Position } from "@/types/message";

class RoomManager {
  public PlayerId: number | null = null;
  private static instance: RoomManager;

  private constructor() { }

  public static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public async createRoom(player: { Name: string; Color: string }, retryCount: number): Promise<number | null> {
    try {
      const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/create`, player);
      const { playerId, roomId } = res.data;
      this.PlayerId = playerId;
      socketManager.connect(roomId);
      return roomId;
      // @ts-expect-error type error  
    } catch (err: AxiosError) {
      if (err.status === 400 && retryCount <= 3) {
        this.createRoom(player, retryCount + 1);
      }
      return null;
    }
  }

  public async joinRoom(player: { Name: string; Color: string }, roomId: number, retryCount: number): Promise<number | null> {
    try {
      const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/join?roomId=${roomId}`, player);
      const { playerId } = res.data;
      this.PlayerId = playerId;
      socketManager.connect(roomId);
      return roomId;
      // @ts-expect-error type error
    } catch (err: AxiosError) {
      if (err.status === 400 && retryCount < 2) {
        this.joinRoom(player, roomId, retryCount + 1);
      }
      return null;
    }
  }

  public leaveRoom() {
    socketManager.disconnect();
    this.PlayerId = null;
  }

  public setPlayerReady({ isReady }: { isReady: boolean }) {
    socketManager.send(SOCKET_EVENT.READY, { isReady });
  }

  public startGame() {
    socketManager.send(SOCKET_EVENT.START, {});
  }

  public kickPlayer(ID: number) {
    socketManager.send(SOCKET_EVENT.KICK, {}, ID);
  }

  public onEvent(event: string, callback: (payload: Payload, ID?: number) => void) {
    socketManager.subscribe(event, callback);
  }

  public offEvent(event: string) {
    socketManager.unsubscribe(event);
  }

  public movePlayer(position: Position) {
    socketManager.send(SOCKET_EVENT.MOVE, { position });
  }

  public shoot() {
    socketManager.send(SOCKET_EVENT.SHOOT, {});
  }
}

export const roomManager = RoomManager.getInstance();