import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import PlayerHand from "./PlayerHand";
import { shuffleAndDeal, getPokerDeck } from "../utils/pokerUtils";

const COUNTDOWN_TIME = 15; // 每回合倒计时（秒）
const GRAB_TIME = 8; // 抢地主倒计时

function getNextPlayer(cur) {
  return (cur + 1) % 3;
}

export default function GameTable({ roomId, playerId, onExit }) {
  // 牌局状态
  const [phase, setPhase] = useState("dealing"); // dealing, grabbing, playing, end
  const [hands, setHands] = useState([[], [], []]); // 3家手牌
  const [bottom, setBottom] = useState([]); // 底牌
  const [landlord, setLandlord] = useState(null); // 地主编号
  const [grabber, setGrabber] = useState(null); // 最后抢到地主的人
  const [grabStep, setGrabStep] = useState(0); // 抢地主轮次
  const [grabRecords, setGrabRecords] = useState([]); // 抢地主记录

  // 出牌
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [lastPlayed, setLastPlayed] = useState([]); // 上一手牌
  const [lastPlayedPlayer, setLastPlayedPlayer] = useState(null);
  const [playedCards, setPlayedCards] = useState([[], [], []]); // 已出牌
  const [selected, setSelected] = useState([]);
  const [passCount, setPassCount] = useState(0);

  // 计时
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const timer = useRef();

  // 记分
  const [scores, setScores] = useState([0, 0, 0]);
  const [gameResult, setGameResult] = useState("");

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

  // 抢地主倒计时
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

  // 抢地主逻辑
  function handleGrab(action) {
    let records = [...grabRecords];
    records.push({ player: currentPlayer, action });
    setGrabRecords(records);

    let next = getNextPlayer(currentPlayer);

    // 记录最后抢地主的人
    let newGrabber = grabber;
    if (action === "grab") newGrabber = currentPlayer;

    // 3轮后无人抢 or 一人抢地主
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
      // 没人抢地主，重新发牌
      setTimeout(() => setPhase("dealing"), 1000);
    } else {
      setGrabber(newGrabber);
      setCurrentPlayer(next);
      setGrabStep(grabStep + 1);
      setCountdown(GRAB_TIME);
    }
  }

  // 出牌逻辑（无牌型判定，仅移除、pass、首出需出牌）
  function handlePlay() {
    if (selected.length === 0) return;
    let myHand = [...hands[currentPlayer]];
    let outCards = selected.map(i => myHand[i]);
    let newHand = myHand.filter((_, i) => !selected.includes(i));
    let newHands = hands.map((h, idx) => (idx === currentPlayer ? newHand : h));
    let newPlayedCards = playedCards.map((h, idx) =>
      idx === currentPlayer ? [...h, ...outCards] : h
    );
    setHands(newHands);
    setPlayedCards(newPlayedCards);
    setLastPlayed(outCards);
    setLastPlayedPlayer(currentPlayer);
    setPassCount(0);
    setSelected([]);

    // 判断胜利
    if (newHand.length === 0) {
      setGameResult(currentPlayer === landlord ? "地主胜" : "农民胜");
      let newScores = [...scores];
      if (currentPlayer === landlord) {
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

    setCurrentPlayer(getNextPlayer(currentPlayer));
    setCountdown(COUNTDOWN_TIME);
  }

  // 不出
  function handlePass() {
    setSelected([]);
    if (lastPlayedPlayer == null || lastPlayedPlayer === currentPlayer) {
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
    setCurrentPlayer(getNextPlayer(currentPlayer));
    setCountdown(COUNTDOWN_TIME);
  }

  function handleRestart() {
    setPhase("dealing");
  }

  // 你是哪个玩家
  const myIdx = parseInt(playerId, 10) || 0;

  return (
    <div>
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
            {bottom.map((c, i) => <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 24, height: 36 }} />)}
          </div>
          <div>当前出牌：玩家{currentPlayer + 1}　倒计时：{countdown}s</div>
          <div>上家出的牌：
            {lastPlayed.map((c, i) => <Card key={i} rank={c.rank} suit={c.suit} style={{ width: 24, height: 36 }} />)}
          </div>
        </div>
      )}
      {phase === "end" && (
        <div>
          <h2>本局结束！{gameResult}</h2>
          <button onClick={handleRestart}>再来一局</button>
        </div>
      )}
      <hr />
      <div>
        {hands.map((hand, idx) => (
          <div key={idx} style={{ margin: 12 }}>
            <div>玩家{idx + 1}{landlord === idx ? "(地主)" : ""}{myIdx === idx ? "(你)" : ""}</div>
            <PlayerHand
              cards={hand}
              selected={myIdx === idx ? selected : []}
              onSelect={myIdx === idx && phase === "playing" && currentPlayer === idx ? (i => {
                setSelected(prev =>
                  prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                );
              }) : () => {}}
              onPlay={myIdx === idx && phase === "playing" && currentPlayer === idx ? handlePlay : () => {}}
              canPlay={phase === "playing" && currentPlayer === idx}
              onPass={myIdx === idx && phase === "playing" && currentPlayer === idx ? handlePass : undefined}
            />
            <div>
              已出牌：
              {playedCards[idx].map((card, i) => (
                <span key={i}><Card rank={card.rank} suit={card.suit} style={{ width: 24, height: 36 }} /></span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
