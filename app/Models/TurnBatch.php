<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TurnBatch extends Model
{
    protected $fillable = [
        'session_id',
        'batch_number',
        'turns_generated',
        'player_choice_trigger',
    ];

    protected $casts = [
        'batch_number' => 'integer',
        'turns_generated' => 'integer',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'session_id');
    }

    public function turns(): HasMany
    {
        return $this->hasMany(Turn::class, 'batch_id');
    }
}
