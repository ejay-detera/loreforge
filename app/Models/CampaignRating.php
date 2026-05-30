<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignRating extends Model
{
    use HasFactory;

    protected $table = 'campaign_ratings';

    protected $fillable = [
        'campaign_id',
        'user_id',
        'rating',
    ];

    public function campaign()
    {
        return $this->belongsTo(SharedCampaign::class, 'campaign_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
