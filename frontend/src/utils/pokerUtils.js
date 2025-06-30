export function getPokerDeck() {
  const suits = ["spades", "hearts", "diamonds", "clubs"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  deck.push({ suit: "joker", rank: "small" }); // 小王
  deck.push({ suit: "joker", rank: "big" }); // 大王
  return deck;
}

export function shuffleAndDeal() {
  let deck = getPokerDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const hands = [[], [], []];
  for (let i = 0; i < 51; i++) hands[i % 3].push(deck[i]);
  const bottom = deck.slice(51);
  return { hands, bottom };
}
