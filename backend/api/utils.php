<?php
function getPokerDeck() {
    $suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    $ranks = ['2','3','4','5','6','7','8','9','10','jack','queen','king','ace'];
    $deck = [];
    foreach ($suits as $suit) {
        foreach ($ranks as $rank) {
            $deck[] = ['suit' => $suit, 'rank' => $rank];
        }
    }
    // 可选：添加大小王
    $deck[] = ['suit' => 'joker', 'rank' => 'black'];
    $deck[] = ['suit' => 'joker', 'rank' => 'red'];
    return $deck;
}
