<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use App\Models\SharedCampaign;
use App\Mail\CampaignActivityMail;

class SendCampaignActivityEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $campaign;
    public $activityType;
    public $activityDetails;

    /**
     * Create a new job instance.
     */
    public function __construct(SharedCampaign $campaign, $activityType, $activityDetails)
    {
        $this->campaign = $campaign;
        $this->activityType = $activityType;
        $this->activityDetails = $activityDetails;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $recipient = $this->campaign->sharedByUser;
        
        if (!$recipient || !$recipient->email) {
            return;
        }

        $dailyLimit = config('mail.notify.daily_limit', 5);
        
        // We only allow X activity emails per user per day to avoid spam.
        $throttleKey = 'email-activity:' . $recipient->id;

        if (RateLimiter::tooManyAttempts($throttleKey, $dailyLimit)) {
            Log::info("Email rate limit exceeded for user {$recipient->id}. Skipping email.");
            return;
        }

        try {
            Mail::to($recipient->email)->send(new CampaignActivityMail($this->campaign, $this->activityType, $this->activityDetails));
            RateLimiter::hit($throttleKey, 86400); // 24 hours
        } catch (\Exception $e) {
            Log::error("Failed to send activity email to user {$recipient->id}: " . $e->getMessage());
        }
    }
}
