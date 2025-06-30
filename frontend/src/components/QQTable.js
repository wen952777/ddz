import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import QQPlayerAvatar from "./QQPlayerAvatar";
import PlayerHand from "./PlayerHand";
import { shuffleAndDeal } from "../utils/pokerUtils";

const AVATARS = [
  "https://qlogo2.store.qq.com/qzone/562626262/562626262/100",
  "https://qlogo2.store.qq.com/qzone/123456789/123456789/100",
  "https://qlogo2.store.qq.com/qzone/987654321/987654321/100"
];

const NICKS = ["我", "小明", "小红"];

const styles = {
  tableWrap: {
    position: "relative",
    width: "100vw",
    height: "calc(100vw * 1.3)",
    maxWidth: 430,
    maxHeight: 560,
    margin: "0 auto",
    background: "radial-gradient(ellipse at center, #268a4e 80%, #144a26 120%)",
    border: "8px solid #145020",
    borderRadius: "50% / 44%",
    boxShadow: "0 0 40px 12px #0a351b",
    marginTop: 12,
    overflow: "visible"
  },
  logo: {
    position: "absolute",
    left: "50%",
    top: "28%",
    transform: "translate(-50%,-50%)",
    fontSize: "2.2rem",
    color: "#fff",
    textShadow: "2px 2px 8px #0a351b",
    fontWeight: "bold",
    letterSpacing: "5px",
    pointerEvents: "none"
  },
  avatar: (pos) => {
    // 椭圆上的位置
    const base = {
      position: "absolute",
      zIndex: 3,
      width: 84,
      textAlign: "center",
    };
    if (pos === "bottom") return { ...base, left: "50%", bottom: "-48px", transform: "translateX(-50%)" };
    if (pos === "left") return { ...base, left: "-36px", top: "21%" };
    if (pos === "right") return { ...base, right: "-36px", top: "21%" };
    return base;
  },
  myHand: {
    position: "absolute",
    left: "50%",
    bottom: "-115px",
    transform: "translateX(-50%)",
    minWidth: 200,
    display: "flex",
    flexDirection: "row",
    gap: 7,
    padding: "8px 7px",
    background: "rgba(255,255,255,0.10)",
    borderRadius: 10,
    zIndex: 4,
    maxWidth: "98vw",
    overflowX: "auto"
  },
  myBtns: {
    position: "absolute",
    left: "50%",
    bottom: "-170px",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "row",
    gap: 38,
    zIndex: 5
  },
  btn: {
    fontSize: "1.1rem",
    padding: "10px 30px",
    borderRadius: 22,
    border: "none",
    background: "linear-gradient(90deg,#ffef8c 60%,#f6c544 100%)",
    color: "#124018",
    fontWeight: "bold",
    margin: 2,
    boxShadow: "0 2px 15px #0004"
  },
  played: {
    position: "absolute",
    left: "50%",
    top: "42%",
    transform: "translate(-50%,-50%)",
    zIndex: 6,
    textAlign: "center"
  },
  playedCards: {
    display: "flex",
    justifyContent: "center",
    gap: "4px",
    minHeight: 26
  },
  topBar: {
    width: "100vw",
    maxWidth: 430,
    margin: "0 auto",
    textAlign: "center",
    marginTop: 5,
    fontSize: "15px",
    color: "#fff",
    textShadow: "1px 2px 6px #0a351b"
  },
};

const COUNTDOWN_TIME = 15;
const GRAB_TIME = 8;

function getNextPlayer(cur) {
  return (cur + 1) % 3;
}

export default function QQTable({ roomId = "123456", playerId = "0", onExit }) {
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

  // 渲染头像
  function renderAvatar(idx, pos) {
    return (
      <div style={styles.avatar(pos)}>
        <QQPlayerAvatar
          avatar={AVATARS[idx]}
          nick={NICKS[idx]}
          isLandlord={landlord === idx}
          isCurrent={currentPlayer === idx}
          cards={pos === "bottom" ? hands[idx] : undefined}
          leftCount={hands[idx].length}
          played={playedCards[idx].slice(-5)}
          isSelf={idx === myIdx}
        />
      </div>
    );
  }

  // 我的手牌
  function renderMyHand() {
    return (
      <div style={styles.myHand}>
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
      </div>
    );
  }

  // 我的操作按钮
  function renderMyBtns() {
    if (
      (phase === "playing" && currentPlayer === myIdx) ||
      (phase === "grabbing" && currentPlayer === myIdx)
    ) {
      return (
        <div style={styles.myBtns}>
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

  // 中间出牌区
  function renderPlayed() {
    if (phase !== "playing" || lastPlayed.length === 0) return null;
    return (
      <div style={styles.played}>
        <div style={{ color: "#fff", fontSize: "1rem", marginBottom: 2 }}>上家出牌</div>
        <div style={styles.playedCards}>
          {lastPlayed.map((c, i) => (
            <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 28, height: 42 }} />
          ))}
        </div>
      </div>
    );
  }

  // 顶部信息栏
  function renderTopBar() {
    return (
      <div style={styles.topBar}>
        <div>
          房间号：{roomId}　
          <button
            style={{
              ...styles.btn,
              fontSize: "0.9rem",
              padding: "2px 14px",
              borderRadius: 10,
              minWidth: "52px",
              minHeight: "28px"
            }}
            onClick={onExit}
          >退出</button>
        </div>
        <div>
          记分：
          {scores.map((s, i) => (
            <span key={i} style={{ marginRight: 8 }}>
              玩家{i + 1}
              {landlord === i ? "【地主】" : ""}
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
              <b>出牌阶段</b> 当前：玩家{currentPlayer + 1} 倒计时：{countdown}s
            </>
          )}
          {phase === "end" && (
            <>
              <b>本局结束！{gameResult}</b>
              <button
                style={{
                  ...styles.btn,
                  fontSize: "0.9rem",
                  padding: "2px 14px",
                  borderRadius: 10,
                  minWidth: "52px",
                  minHeight: "28px"
                }}
                onClick={handleRestart}
              >再来一局</button>
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
        {phase !== "grabbing" && landlord != null && (
          <div style={{ color: "#fff" }}>
            底牌：
            {bottom.map((c, i) => (
              <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 22, height: 32 }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {renderTopBar()}
      <div style={styles.tableWrap}>
        <div style={styles.logo}>斗地主</div>
        {renderAvatar(leftIdx, "left")}
        {renderAvatar(rightIdx, "right")}
        {renderAvatar(myIdx, "bottom")}
        {renderPlayed()}
        {renderMyHand()}
        {renderMyBtns()}
      </div>
    </div>
  );
}
