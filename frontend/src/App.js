import React, { useState } from "react";
import Room from "./components/Room";
import GameTable from "./components/GameTable";

export default function App() {
  // 房间信息
  const [roomId, setRoomId] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [playerId, setPlayerId] = useState(""); // 当前玩家编号（0、1、2）

  // 加入/创建房间
  function handleJoinRoom(id, fast = false) {
    setRoomId(id || (Math.random().toString(36).slice(2, 8))); // 随机房间
    setPlayerId(fast ? Math.floor(Math.random() * 3).toString() : "0");
    setInRoom(true);
  }

  function handleExitRoom() {
    setInRoom(false);
    setRoomId("");
    setPlayerId("");
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>斗地主</h1>
      {!inRoom ? (
        <Room onJoin={handleJoinRoom} />
      ) : (
        <GameTable
          roomId={roomId}
          playerId={playerId}
          onExit={handleExitRoom}
        />
      )}
    </div>
  );
}
