import React, { useState } from "react";

export default function Room({ onJoin }) {
  const [input, setInput] = useState("");

  return (
    <div>
      <div>
        <input
          placeholder="输入房间号(6位)"
          value={input}
          maxLength={6}
          onChange={e => setInput(e.target.value.replace(/\D/g, ""))}
        />
        <button disabled={!input} onClick={() => onJoin(input)}>加入房间</button>
      </div>
      <div style={{ margin: 8 }}>
        <button onClick={() => onJoin("", true)}>快速匹配</button>
      </div>
      <div>
        <button onClick={() => onJoin(Math.random().toString().slice(2, 8))}>创建新房间</button>
      </div>
    </div>
  );
}
