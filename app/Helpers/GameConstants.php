<?php

namespace App\Helpers;

class GameConstants
{
    const STARTING_HP        = 100;
    const STARTING_MP        = 50;
    const MAX_HP             = 100;
    const MAX_MP             = 50;
    const POTION_HEAL_HP     = 25;
    const POTION_RESTORE_MP  = 20;
    const DEFAULT_MAX_TURNS  = 20;
    const FLEE_HP_THRESHOLD  = 0.10; // 10% of max HP
    const MP_MAGIC_THRESHOLD = 10;
    const WEAK_ARC_END_RATIO = 0.35;
    const MID_ARC_END_RATIO  = 0.70;
    const STARTER_ITEMS = [
        ['item_name' => 'Healing Potion', 'description' => 'Restores +25 HP when used.'],
        ['item_name' => 'Healing Potion', 'description' => 'Restores +25 HP when used.'],
        ['item_name' => 'Mana Potion',    'description' => 'Restores +20 MP when used.'],
        ['item_name' => 'Mana Potion',    'description' => 'Restores +20 MP when used.'],
    ];
}
