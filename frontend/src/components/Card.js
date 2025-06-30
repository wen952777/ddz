import React from "react";

export default function Card({ rank, suit, style = {}, back }) {
  if (back) {
    // 背面牌（蓝背或红背图片，也可用css画）
    return (
      <div style={{
        width: style.width || 60,
        height: style.height || 90,
        background: "linear-gradient(135deg,#3494e6 70%,#ec6ead 100%)",
        border: "2px solid #fff",
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: (style.width || 60) / 3,
        boxShadow: "0 2px 5px #0003",
        ...style
      }}>
        <span>♠️</span>
      </div>
    );
  }
  if (suit === "joker") {
    const imgName = rank === "big" ? "red_joker.svg" : "black_joker.svg";
    const imgSrc = `/cards/${imgName}`;
    return (
      <img
        src={imgSrc}
        alt={rank === "big" ? "大王" : "小王"}
        title={rank === "big" ? "大王" : "小王"}
        style={{ width: style.width || 60, height: style.height || 90, ...style }}
        draggable={false}
      />
    );
  }
  const rankMap = { A: "ace", J: "jack", Q: "queen", K: "king" };
  const imgName = `${rankMap[rank] || rank}_of_${suit}.svg`;
  const imgSrc = `/cards/${imgName}`;
  return (
    <img
      src={imgSrc}
      alt={`${suit}${rank}`}
      title={`${suit}${rank}`}
      style={{ width: style.width || 60, height: style.height || 90, ...style }}
      draggable={false}
    />
  );
}
