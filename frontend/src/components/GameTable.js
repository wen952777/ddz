import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import PlayerHand from "./PlayerHand";
import { shuffleAndDeal } from "../utils/pokerUtils";

// 响应式+旋转牌桌+椭圆形深绿色桌面
const styles = {
  root: {
    position: "fixed",
    inset: 0,
    background: "#224422",
    zIndex: 0,
    minHeight: "100vh",
    minWidth: "100vw",
  },
  tableWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "96vw",
    height: "70vw",
    maxWidth: "650px",
    maxHeight: "470px",
    minWidth: "330px",
    minHeight: "240px",
    transform: "translate(-50%,-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    transition: "all 0.3s"
  },
  table: {
    width: "100%",
    height: "100%",
    background: "radial-gradient(ellipse at center, #278a4e 70%, #154a26 120%)",
    border: "8px solid #145020",
    borderRadius: "50% / 45%",
    boxShadow: "0 0 35px 6px #0a351b",
    position: "relative",
    overflow: "visible",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  player: (pos, isLandlord, isCurrent) => {
    const common = {
      position: "absolute",
      color: "#fff",
      fontWeight: isLandlord ? "bold" : undefined,
      background: "rgba(0,0,0,0.18)",
      padding: "6px 14px",
      borderRadius: 12,
      border: isCurrent ? "2px solid #ff0" : "2px solid #fff1",
      minWidth: 72,
      textAlign: "center",
      zIndex: 2,
      fontSize: "15px"
    };
    if (pos === "left") return { ...common, left: "-25px", top: "54px" };
    if (pos === "right") return { ...common, right: "-25px", top: "54px" };
    if (pos === "top") return { ...common, left: "50%", top: "-28px", transform: "translateX(-50%)" };
    if (pos === "bottom") return { ...common, left: "50%", bottom: "-12px", transform: "translateX(-50%)" };
    return common;
  },
  playedCards: {
    marginTop: 2,
    marginBottom: 0,
    display: "flex",
    justifyContent: "center",
    gap: "3px",
    minHeight: 26,
  },
  playedCardImg: {
    width: 18, height: 27,
  },
  myHandArea: {
    position: "absolute",
    left: "50%",
    bottom: "-80px",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "row",
    gap: "7px",
    flexWrap: "nowrap",
    overflowX: "auto",
    background: "rgba(20,40,18,0.10)",
    borderRadius: 8,
    padding: "6px 10px",
    zIndex: 2,
    minWidth: "200px",
    maxWidth: "95vw"
  },
  myBtnArea: {
    position: "absolute",
    left: "50%",
    bottom: "-135px",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "row",
    gap: "16vw",
    zIndex: 3,
  },
  btn: {
    fontSize: "19px",
    padding: "9px 22px",
    borderRadius: 9,
    border: "none",
    background: "#f6c544",
    color: "#124018",
    margin: 2,
    minWidth: "90px",
    minHeight: "38px",
    boxShadow: "0 2px 7px #0005"
  },
  smallBtn: {
    fontSize: "15px",
    padding: "2px 14px",
    borderRadius: 7,
    border: "none",
    background: "#53c0a8",
    color: "#fff",
    margin: 2,
    minWidth: "52px",
    minHeight: "28px",
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: "16px",
    zIndex: 10,
    background: "rgba(0,0,0,0.25)",
    padding: "8px 0 2px 0"
  },
  // 横屏模式整体包裹
  rotate: {
    position: "fixed",
    left: 0, top: 0, right: 0, bottom: 0,
    width: "100vw", height: "100vh",
    transform: "rotate(90deg)",
    transformOrigin: "center center",
    background: "#224422",
    zIndex: 100,
    overflow: "hidden"
  }
};

const COUNTDOWN_TIME = 15;
const GRAB_TIME = 8;

// 横屏切换阈值
const ROTATE_THRESHOLD = 520;

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
  const [rotate, setRotate] = useState(window.innerWidth < ROTATE_THRESHOLD);

  const myIdx = parseInt(playerId, 10) || 0;
  const leftIdx = (myIdx + 1) % 3;
  const rightIdx = (myIdx + 2) % 3;

  // 旋转检测
  useEffect(() => {
    function onResize() {
      setRotate(window.innerWidth < ROTATE_THRESHOLD || window.innerHeight < 350);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
      <div style={styles.player(pos, landlord === idx, currentPlayer === idx)}>
        <div>
          玩家{idx + 1}
          {landlord === idx ? "【地主】" : ""}
          {currentPlayer === idx ? "（出牌中）" : ""}
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

  // 椭圆桌面和玩家布局
  const tableContent = (
    <div style={styles.tableWrap}>
      <div style={styles.table}>
        {/* 左侧玩家 */}
        {renderOtherPlayer(leftIdx, "left")}
        {/* 顶部玩家 */}
        {renderOtherPlayer(rightIdx, "right")}
        {/* 你 */}
        <div style={styles.player("bottom", landlord === myIdx, currentPlayer === myIdx)}>
          玩家{myIdx + 1}{landlord === myIdx ? "【地主】" : ""}(你)
        </div>
        {/* 出牌区 */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%,-50%)",
          zIndex: 3,
          textAlign: "center",
        }}>
          {phase === "playing" && lastPlayed.length > 0 && (
            <div>
              <div style={{color:"#fc6",fontSize:"15px"}}>上家出牌</div>
              <div style={styles.playedCards}>
                {lastPlayed.map((c, i) => (
                  <Card key={i} rank={c.rank} suit={c.suit} style={{width:24,height:36}} />
                ))}
              </div>
            </div>
          )}
        </div>
        {/* 底牌 */}
        {phase !== "grabbing" && landlord != null && (
          <div style={{
            position: "absolute",
            left: "50%",
            top: "7%",
            transform: "translateX(-50%)",
            color:"#fff",
            fontSize:"14px"
          }}>
            底牌：
            {bottom.map((c, i) => (
              <Card key={i} rank={c.rank} suit={c.suit} style={styles.playedCardImg} />
            ))}
          </div>
        )}
        {/* 我的手牌 */}
        {renderMyHand()}
        {/* 我的操作按钮 */}
        {renderMyBtnArea()}
      </div>
    </div>
  );

  // 顶部信息栏
  const topBar = (
    <div style={styles.topBar}>
      <div>
        房间号：{roomId}　
        <button style={styles.smallBtn} onClick={onExit}>退出</button>
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
    </div>
  );

  return (
    <div style={styles.root}>
      {topBar}
      {rotate ? (
        <div style={styles.rotate}>
          {tableContent}
        </div>
      ) : (
        tableContent
      )}
    </div>
  );
}
