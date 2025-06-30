import React, { useState } from "react";
import { Game3D_Cartoon, CardType, PlayerInfo } from "./components/Game3D_Cartoon";

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
  // 三位玩家
  const players: PlayerInfo[] = [
    { name: "你", avatarUrl: "/avatars/default.png" },
    { name: "玩家2", avatarUrl: "/avatars/default.png" },
    { name: "玩家3", avatarUrl: "/avatars/default.png" }
  ];

  return (
    <div style={{background:"#f2efe6",minHeight:"100vh",padding:"0",margin:"0"}}>
      <h2 style={{
        textAlign: "center", 
        color: "#2d72fc", 
        marginTop: 18, 
        fontWeight: 900, 
        letterSpacing: 3, 
        fontSize: "2.1em",
        textShadow: "0 2px 8px #fff"
      }}>3D 斗地主</h2>
      <Game3D_Cartoon myCards={myCards} outCards={outCards} players={players} />
      <div style={{
        color:"#888",
        textAlign:"center",
        marginTop:15,
        fontSize:15
      }}>
        卡通风3D桌面 | 仅为美观演示，可拓展动画和交互
      </div>
    </div>
  );
};
