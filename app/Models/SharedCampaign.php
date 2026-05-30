<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SharedCampaign extends Model
{
    protected $fillable = [
        'session_id',
        'shared_by',
        'story_preview',
        'shared_at',
    ];

    protected $casts = [
        'shared_at' => 'datetime',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'session_id');
    }

    public function sharedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(CampaignRating::class, 'campaign_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CampaignComment::class, 'campaign_id');
    }
}
