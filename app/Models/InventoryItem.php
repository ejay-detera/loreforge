<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    protected $fillable = [
        'session_id',
        'item_name',
        'description',
        'acquired_at',
        'removed_at',
    ];

    protected $casts = [
        'acquired_at' => 'integer',
        'removed_at' => 'integer',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'session_id');
    }
}
