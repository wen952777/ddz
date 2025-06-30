import React from "react";

/**
 * @param {string} rank
 * @param {string} suit
 * @param {object} style
 */
export default function Card({ rank, suit, style = {} }) {
  if (suit === "joker") {
    // 大小王图片命名兼容
    const imgName = rank === "big" ? "red_joker.svg" : "black_joker.svg";
    const imgSrc = `/cards/${imgName}`;
    return (
      <img
        src={imgSrc}
        alt={rank === "big" ? "大王" : "小王"}
        title={rank === "big" ? "大王" : "小王"}
        style={{ width: 60, height: 90, ...style }}
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
      style={{ width: 60, height: 90, ...style }}
      draggable={false}
    />
  );
}
