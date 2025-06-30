import React from "react";

/**
 * card对象示例：{ suit: "spades", rank: "ace" }
 * 图片应放在 public/cards/ 下
 */
export default function Card({ suit, rank }) {
  // rank英文映射
  const rankMap = {
    'A': 'ace',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'jack',
    'Q': 'queen',
    'K': 'king'
  };

  // suit英文映射
  const suitMap = {
    'spades': 'spades',
    'hearts': 'hearts',
    'diamonds': 'diamonds',
    'clubs': 'clubs',
    '黑桃': 'spades',
    '红桃': 'hearts',
    '方块': 'diamonds',
    '梅花': 'clubs'
  };

  // 获取图片文件名
  const imgName = `${rankMap[rank] || rank}_of_${suitMap[suit] || suit}.svg`;
  const imgSrc = `/cards/${imgName}`;

  return (
    <img
      src={imgSrc}
      alt={`${rank} of ${suit}`}
      style={{ width: "70px", height: "100px" }}
    />
  );
}
