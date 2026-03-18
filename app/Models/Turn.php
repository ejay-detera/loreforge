<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Turn extends Model
{
    protected $fillable = [
        'session_id',
        'batch_id',
        'turn_number',
        'story_text',
        'choices',
        'outcomes',
        'player_choice',
        'health_change',
        'mana_change',
        'enemy_hp_change',
        'is_resolved',
    ];

    protected $casts = [
        'choices' => 'array',
        'outcomes' => 'array',
        'is_resolved' => 'boolean',
        'batch_id' => 'integer',
        'turn_number' => 'integer',
        'health_change' => 'integer',
        'mana_change' => 'integer',
        'enemy_hp_change' => 'integer',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'session_id');
    }
}
