<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignComment extends Model
{
    use HasFactory;

    protected $table = 'campaign_comments';

    protected $fillable = [
        'campaign_id',
        'user_id',
        'body',
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
