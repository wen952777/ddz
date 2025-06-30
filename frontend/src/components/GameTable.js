import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import PlayerHand from "./PlayerHand";
import { shuffleAndDeal } from "../utils/pokerUtils";

const COUNTDOWN_TIME = 15; // 每回合倒计时
const GRAB_TIME = 8; // 抢地主倒计时

function getNextPlayer(cur) {
  return (cur + 1) % 3;
}

export default function GameTable({ roomId, playerId, onExit }) {
  // 牌局状态
  const [phase, setPhase] = useState("dealing");
  const [hands, setHands] = useState([[], [], []]);
  const [bottom, setBottom] = useState([]);
  const [landlord, setLandlord] = useState(null);
  const [grabber, setGrabber] = useState(null);
  const [grabStep, setGrabStep] = useState(0);
  const [grabRecords, setGrabRecords] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [lastPlayed, setLastPlayed] = useState([]);
  const [lastPlayedPlayer, setLastPlayedPlayer] = useState(null);
  const [playedCards, setPlayedCards] = useState([[], [], []]);
  const [selected, setSelected] = useState([]);
  const [passCount, setPassCount] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const timer = useRef();
  const [scores, setScores] = useState([0, 0, 0]);
  const [gameResult, setGameResult] = useState("");

  // 你是哪个玩家
  const myIdx = parseInt(playerId, 10) || 0;
  // 其他两家在左上和右上
  const leftIdx = (myIdx + 1) % 3;
  const rightIdx = (myIdx + 2) % 3;

  // 发牌
  useEffect(() => {
    if (phase === "dealing") {
      const { hands, bottom } = shuffleAndDeal();
      setHands(hands);
      setBottom(bottom);
      setLandlord(null);
      setGrabber(null);
      setGrabStep(0);
      setGrabRecords([]);
      setCurrentPlayer(0);
      setLastPlayed([]);
      setLastPlayedPlayer(null);
      setPlayedCards([[], [], []]);
      setPassCount(0);
      setCountdown(GRAB_TIME);
      setGameResult("");
      setPhase("grabbing");
    }
    // eslint-disable-next-line
  }, [phase]);

  // 抢地主/出牌倒计时
  useEffect(() => {
    if (phase === "grabbing" || phase === "playing") {
      setCountdown(phase === "grabbing" ? GRAB_TIME : COUNTDOWN_TIME);
      clearInterval(timer.current);
      timer.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(timer.current);
            if (phase === "grabbing") {
              handleGrab("pass");
            } else {
              handlePass();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer.current);
    // eslint-disable-next-line
  }, [phase, currentPlayer, grabStep]);

  // 抢地主
  function handleGrab(action) {
    let records = [...grabRecords];
    records.push({ player: currentPlayer, action });
    setGrabRecords(records);

    let next = getNextPlayer(currentPlayer);
    let newGrabber = grabber;
    if (action === "grab") newGrabber = currentPlayer;

    if (grabStep >= 2 && newGrabber !== null) {
      setLandlord(newGrabber);
      let newHands = hands.map((h, idx) =>
        idx === newGrabber ? h.concat(bottom) : h
      );
      setHands(newHands);
      setCurrentPlayer(newGrabber);
      setPhase("playing");
      setGrabber(null);
      setCountdown(COUNTDOWN_TIME);
    } else if (grabStep >= 2 && newGrabber == null) {
      setTimeout(() => setPhase("dealing"), 1000);
    } else {
      setGrabber(newGrabber);
      setCurrentPlayer(next);
      setGrabStep(grabStep + 1);
      setCountdown(GRAB_TIME);
    }
  }

  // 出牌
  function handlePlay() {
    if (selected.length === 0) return;
    let myHand = [...hands[myIdx]];
    let outCards = selected.map(i => myHand[i]);
    let newHand = myHand.filter((_, i) => !selected.includes(i));
    let newHands = hands.map((h, idx) => (idx === myIdx ? newHand : h));
    let newPlayedCards = playedCards.map((h, idx) =>
      idx === myIdx ? [...h, ...outCards] : h
    );
    setHands(newHands);
    setPlayedCards(newPlayedCards);
    setLastPlayed(outCards);
    setLastPlayedPlayer(myIdx);
    setPassCount(0);
    setSelected([]);

    // 判断胜利
    if (newHand.length === 0) {
      setGameResult(myIdx === landlord ? "地主胜" : "农民胜");
      let newScores = [...scores];
      if (myIdx === landlord) {
        newScores[landlord] += 2;
        newScores[(landlord + 1) % 3] -= 1;
        newScores[(landlord + 2) % 3] -= 1;
      } else {
        newScores[landlord] -= 2;
        newScores[(landlord + 1) % 3] += 1;
        newScores[(landlord + 2) % 3] += 1;
      }
      setScores(newScores);
      setPhase("end");
      clearInterval(timer.current);
      return;
    }

    setCurrentPlayer(getNextPlayer(myIdx));
    setCountdown(COUNTDOWN_TIME);
  }

  // 不出
  function handlePass() {
    setSelected([]);
    if (lastPlayedPlayer == null || lastPlayedPlayer === myIdx) {
      // 必须出牌
      return;
    }
    let newPassCount = passCount + 1;
    if (newPassCount === 2) {
      // 两家都pass，重置上一手
      setLastPlayed([]);
      setLastPlayedPlayer(null);
      setPassCount(0);
    } else {
      setPassCount(newPassCount);
    }
    setCurrentPlayer(getNextPlayer(myIdx));
    setCountdown(COUNTDOWN_TIME);
  }

  function handleRestart() {
    setPhase("dealing");
  }

  // 渲染其余玩家（只显示剩余牌数）
  function renderOtherPlayer(idx, position) {
    return (
      <div style={{
        position: "absolute",
        left: position === "left" ? 12 : undefined,
        right: position === "right" ? 12 : undefined,
        top: 12,
        textAlign: "center"
      }}>
        <div>
          玩家{idx + 1}{landlord === idx ? "(地主)" : ""}{currentPlayer === idx ? "（出牌中）" : ""}
        </div>
        <div>剩余：{hands[idx].length} 张</div>
        <div>
          已出牌：
          {playedCards[idx].map((card, i) => (
            <span key={i}><Card rank={card.rank} suit={card.suit} style={{ width: 18, height: 27 }} /></span>
          ))}
        </div>
      </div>
    );
  }

  // 渲染自己（底部中间）
  function renderMyHand() {
    return (
      <div style={{
        position: "absolute",
        left: "50%",
        bottom: 8,
        transform: "translateX(-50%)",
        textAlign: "center"
      }}>
        <div>玩家{myIdx + 1}{landlord === myIdx ? "(地主)" : ""} (你)</div>
        <PlayerHand
          cards={hands[myIdx]}
          selected={selected}
          onSelect={phase === "playing" && currentPlayer === myIdx ? (i =>
            setSelected(prev =>
              prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
            )
          ) : () => {}}
          onPlay={phase === "playing" && currentPlayer === myIdx ? handlePlay : () => {}}
          canPlay={phase === "playing" && currentPlayer === myIdx}
          onPass={phase === "playing" && currentPlayer === myIdx ? handlePass : undefined}
        />
        <div>
          已出牌：
          {playedCards[myIdx].map((card, i) => (
            <span key={i}><Card rank={card.rank} suit={card.suit} style={{ width: 18, height: 27 }} /></span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: 440, margin: "0 auto" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center" }}>
        <div>
          房间号：{roomId}　<button onClick={onExit}>退出房间</button>
        </div>
        <div>记分：{scores.map((s, i) => (
          <span key={i} style={{ marginRight: 12 }}>
            玩家{i + 1}{landlord === i ? "(地主)" : ""}：{s}
          </span>
        ))}</div>
        {phase === "grabbing" && (
          <div>
            <h3>抢地主阶段</h3>
            <div>当前轮到：玩家{currentPlayer + 1}</div>
            <div>倒计时：{countdown}s</div>
            {myIdx === currentPlayer && (
              <div>
                <button onClick={() => handleGrab("grab")}>抢地主</button>
                <button onClick={() => handleGrab("pass")}>不抢</button>
              </div>
            )}
            <div>
              抢地主记录：{grabRecords.map((rec, i) =>
                <span key={i}>玩家{rec.player + 1}{rec.action === "grab" ? "抢" : "不抢"}　</span>
              )}
            </div>
          </div>
        )}
        {phase === "playing" && (
          <div>
            <h3>出牌阶段</h3>
            <div>地主：玩家{landlord + 1}　底牌：
              {bottom.map((c, i) => <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 18, height: 27 }} />)}
            </div>
            <div>当前出牌：玩家{currentPlayer + 1}　倒计时：{countdown}s</div>
            <div>上家出的牌：
              {lastPlayed.map((c, i) => <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 18, height: 27 }} />)}
            </div>
          </div>
        )}
        {phase === "end" && (
          <div>
            <h2>本局结束！{gameResult}</h2>
            <button onClick={handleRestart}>再来一局</button>
          </div>
        )}
      </div>

      {/* 左上角玩家 */}
      {renderOtherPlayer(leftIdx, "left")}
      {/* 右上角玩家 */}
      {renderOtherPlayer(rightIdx, "right")}
      {/* 底部自己 */}
      {renderMyHand()}
    </div>
  );
}
