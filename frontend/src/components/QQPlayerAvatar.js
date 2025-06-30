import React from "react";
import Card from "./Card";

// QQ风格头像、昵称、地主标记、剩余牌数
export default function QQPlayerAvatar({
  avatar,
  nick,
  isLandlord,
  isCurrent,
  cards,
  leftCount,
  played,
  isSelf
}) {
  return (
    <div>
      <div
        style={{
          border: isLandlord ? "2px solid #f8b400" : "2px solid #fff",
          boxShadow: isCurrent ? "0 0 12px #f8b400" : "none",
          borderRadius: "50%",
          width: 54,
          height: 54,
          overflow: "hidden",
          margin: "0 auto",
          background: "#fff"
        }}
      >
        <img
          src={avatar}
          alt={nick}
          style={{ width: 54, height: 54, borderRadius: "50%" }}
        />
      </div>
      <div style={{ fontSize: "14px", color: "#fff", marginTop: 2 }}>
        {nick} {isLandlord && <span style={{
          color: "#f6c544",
          fontWeight: "bold",
          fontSize: "12px",
          background: "#633",
          borderRadius: 6,
          padding: "1px 5px",
          marginLeft: 2
        }}>地主</span>}
      </div>
      <div style={{ fontSize: 13, color: "#fff" }}>
        {isSelf
          ? (cards ? `手牌：${cards.length}` : null)
          : (
            <>
              <Card back style={{ width: 20, height: 29 }} />
              ×{leftCount}
            </>
          )
        }
      </div>
      {played && played.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {played.map((c, i) => (
            <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 16, height: 23 }} />
          ))}
        </div>
      )}
    </div>
  );
}
