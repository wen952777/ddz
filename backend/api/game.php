<?php
require_once "utils.php";
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

// 示例接口，返回一副新牌
if ($_GET['action'] === 'new_deck') {
    echo json_encode([
        'success' => true,
        'deck' => getPokerDeck()
    ]);
    exit;
}

// TODO: 实现更多接口，如：匹配房间、出牌、同步状态等
echo json_encode(['success' => false, 'msg' => 'Unknown action']);
