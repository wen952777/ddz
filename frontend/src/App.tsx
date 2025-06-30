import React, { useState } from "react";
import { Game3D, CardType, PlayerInfo } from "./components/Game3D";

export const App: React.FC = () => {
  // 示例：五张手牌
  const [myCards] = useState<CardType[]>([
    { suit: "spades", rank: "ace" },
    { suit: "hearts", rank: "king" },
    { suit: "clubs", rank: "10" },
    { suit: "diamonds", rank: "queen" },
    { suit: "hearts", rank: "jack" }
  ]);
  // 示例：出牌区
  const [outCards] = useState<CardType[]>([
    { suit: "spades", rank: "ace" },
    { suit: "hearts", rank: "king" }
  ]);
  // 示例：三位玩家
  const players: PlayerInfo[] = [
    { name: "你" },
    { name: "玩家2" },
    { name: "玩家3" }
  ];

  return (
    <div>
      <h2 style={{textAlign: "center", color: "#fff", marginTop: 10}}>3D 斗地主</h2>
      <Game3D myCards={myCards} outCards={outCards} players={players} />
      <div style={{color:"#fff",textAlign:"center",marginTop:10,fontSize:16}}>
        仅为3D桌面演示，可拓展动画和交互
      </div>
    </div>
  );
};
