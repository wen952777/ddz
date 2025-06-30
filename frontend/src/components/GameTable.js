import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import PlayerHand from "./PlayerHand";
import { shuffleAndDeal } from "../utils/pokerUtils";

// 响应式布局样式
const styles = {
  container: {
    position: "relative",
    width: "100vw",
    minHeight: "100vh",
    background: "#f5f5f5",
    overflow: "hidden",
    fontSize: "16px",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    padding: "8px 0 2px 0",
    background: "#fff",
    borderBottom: "1px solid #eee",
    textAlign: "center",
    zIndex: 2,
  },
  player: (pos) => ({
    position: "absolute",
    top: "48px",
    left: pos === "left" ? "2vw" : undefined,
    right: pos === "right" ? "2vw" : undefined,
    width: "36vw",
    maxWidth: 180,
    padding: 2,
    textAlign: "center",
    zIndex: 1,
    background: "rgba(255,255,255,0.85)",
    borderRadius: 8,
    fontSize: "15px",
  }),
  myHandArea: {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: "12vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 2,
  },
  myHandInner: {
    display: "flex",
    flexDirection: "row",
    gap: "7px",
    flexWrap: "nowrap",
    overflowX: "auto",
    padding: "2vw 2vw 0 2vw",
    maxWidth: "100vw",
  },
  myBtnArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "4vw",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: "18vw",
    zIndex: 3,
  },
  btn: {
    fontSize: "18px",
    padding: "7px 20px",
    borderRadius: 10,
    border: "none",
    background: "#4e7cff",
    color: "#fff",
    margin: 2,
    minWidth: "80px",
    minHeight: "38px",
  },
  smallBtn: {
    fontSize: "15px",
    padding: "3px 14px",
    borderRadius: 7,
    border: "none",
    background: "#4e7cff",
    color: "#fff",
    margin: 2,
    minWidth: "54px",
    minHeight: "28px",
  },
  playedCards: {
    display: "flex",
    justifyContent: "center",
    gap: "2px",
    marginTop: 2,
    minHeight: 30,
  },
  playedCardImg: {
    width: 18, height: 27,
  }
};

const COUNTDOWN_TIME = 15;
const GRAB_TIME = 8;

function getNextPlayer(cur) {
  return (cur + 1) % 3;
}

export default function GameTable({ roomId, playerId, onExit }) {
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

  const myIdx = parseInt(playerId, 10) || 0;
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

  function renderOtherPlayer(idx, pos) {
    return (
      <div style={styles.player(pos)}>
        <div>
          玩家{idx + 1}{landlord === idx ? "(地主)" : ""}{currentPlayer === idx ? "（出牌中）" : ""}
        </div>
        <div>剩余：{hands[idx].length} 张</div>
        <div style={styles.playedCards}>
          {playedCards[idx].slice(-5).map((card, i) => (
            <Card key={i} rank={card.rank} suit={card.suit} style={styles.playedCardImg} />
          ))}
        </div>
      </div>
    );
  }

  function renderMyHand() {
    return (
      <div style={styles.myHandArea}>
        <div style={styles.myHandInner}>
          {hands[myIdx].map((card, idx) => (
            <div
              key={idx}
              style={{
                border: selected.includes(idx) ? "2px solid #f00" : "2px solid transparent",
                borderRadius: 8,
                background: "#fff",
              }}
              onClick={phase === "playing" && currentPlayer === myIdx
                ? () =>
                    setSelected((prev) =>
                      prev.includes(idx)
                        ? prev.filter((i) => i !== idx)
                        : [...prev, idx]
                    )
                : undefined}
            >
              <Card rank={card.rank} suit={card.suit} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderMyBtnArea() {
    // 仅自己出牌时显示
    if (
      (phase === "playing" && currentPlayer === myIdx) ||
      (phase === "grabbing" && currentPlayer === myIdx)
    ) {
      return (
        <div style={styles.myBtnArea}>
          {phase === "grabbing" ? (
            <>
              <button style={styles.btn} onClick={() => handleGrab("grab")}>
                抢地主
              </button>
              <button style={styles.btn} onClick={() => handleGrab("pass")}>
                不抢
              </button>
            </>
          ) : (
            <>
              <button
                style={styles.btn}
                onClick={handlePlay}
                disabled={selected.length === 0}
              >
                出牌
              </button>
              <button style={styles.btn} onClick={handlePass}>
                不出
              </button>
            </>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div style={styles.container}>
      {/* 顶部栏 */}
      <div style={styles.topBar}>
        <div>
          房间号：{roomId}&nbsp;
          <button style={styles.smallBtn} onClick={onExit}>退出</button>
        </div>
        <div>
          记分：
          {scores.map((s, i) => (
            <span key={i} style={{ marginRight: 8 }}>
              玩家{i + 1}
              {landlord === i ? "(地主)" : ""}
              ：{s}
            </span>
          ))}
        </div>
        <div>
          {phase === "grabbing" && (
            <>
              <b>抢地主阶段</b> 当前：玩家{currentPlayer + 1} 倒计时：{countdown}s
            </>
          )}
          {phase === "playing" && (
            <>
              <b>出牌阶段</b> 地主：玩家{landlord + 1} 底牌：
              {bottom.map((c, i) => (
                <Card key={i} rank={c.rank} suit={c.suit} style={styles.playedCardImg} />
              ))}
              当前：玩家{currentPlayer + 1} 倒计时：{countdown}s
            </>
          )}
          {phase === "end" && (
            <>
              <b>本局结束！{gameResult}</b>
              <button style={styles.smallBtn} onClick={handleRestart}>再来一局</button>
            </>
          )}
        </div>
        {phase === "grabbing" && (
          <div>
            抢地主记录：
            {grabRecords.map((rec, i) => (
              <span key={i}>
                玩家{rec.player + 1}
                {rec.action === "grab" ? "抢" : "不抢"}　
              </span>
            ))}
          </div>
        )}
        {phase === "playing" && (
          <div>
            上家出的牌：
            {lastPlayed.map((c, i) => (
              <Card key={i} rank={c.rank} suit={c.suit} style={styles.playedCardImg} />
            ))}
          </div>
        )}
      </div>
      {/* 左上角玩家 */}
      {renderOtherPlayer(leftIdx, "left")}
      {/* 右上角玩家 */}
      {renderOtherPlayer(rightIdx, "right")}
      {/* 底部自己 */}
      {renderMyHand()}
      {/* 底部按钮 */}
      {renderMyBtnArea()}
    </div>
  );
}
