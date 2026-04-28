<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameSession extends Model
{
    protected $fillable = [
        'genre',
        'character_name',
        'current_health',
        'max_health',
        'current_mana',
        'max_mana',
        'turn_count',
        'max_turns',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'current_health' => 'integer',
        'max_health' => 'integer',
        'current_mana' => 'integer',
        'max_mana' => 'integer',
        'turn_count' => 'integer',
        'max_turns' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function turns(): HasMany
    {
        return $this->hasMany(Turn::class, 'session_id');
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'session_id');
    }

    public function sharedCampaigns(): HasMany
    {
        return $this->hasMany(SharedCampaign::class, 'session_id');
    }
}
