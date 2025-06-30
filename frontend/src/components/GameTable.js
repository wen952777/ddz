import React from "react";
import Card from "./Card";

// 示例牌组
const exampleCards = [
  { suit: "spades", rank: "A" },    // 黑桃A
  { suit: "clubs", rank: "10" },    // 梅花10
  { suit: "diamonds", rank: "K" },  // 方块K
  { suit: "hearts", rank: "Q" },    // 红桃Q
  { suit: "spades", rank: "J" }     // 黑桃J
];

export default function GameTable() {
  return (
    <div>
      <h2>玩家的手牌</h2>
      <div style={{ display: "flex", gap: "8px" }}>
        {exampleCards.map((card, idx) => (
          <Card key={idx} suit={card.suit} rank={card.rank} />
        ))}
      </div>
    </div>
  );
}
