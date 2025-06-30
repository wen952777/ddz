import React from "react";
import Card from "./Card";

/**
 * @param {Array} cards - 手牌数组 [{rank, suit}]
 * @param {Array} selected - 选中的牌序号数组
 * @param {Function} onSelect - 选牌回调
 * @param {Function} onPlay - 出牌回调
 * @param {Function} onPass - 不出回调
 * @param {Boolean} canPlay - 是否轮到可操作
 */
export default function PlayerHand({ cards, selected = [], onSelect, onPlay, onPass, canPlay }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 6 }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              border: selected.includes(idx) ? "2px solid #f00" : "2px solid transparent",
              borderRadius: 8,
              cursor: canPlay ? "pointer" : "default"
            }}
            onClick={canPlay ? () => onSelect(idx) : undefined}
          >
            <Card rank={card.rank} suit={card.suit} />
          </div>
        ))}
      </div>
      {canPlay && (
        <div style={{ marginTop: 8 }}>
          <button onClick={onPlay} disabled={selected.length === 0}>
            出牌
          </button>
          {onPass && (
            <button onClick={onPass} style={{ marginLeft: 8 }}>
              不出
            </button>
          )}
        </div>
      )}
    </div>
  );
}
