<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\SharedCampaign;

class CampaignActivityMail extends Mailable
{
    use Queueable, SerializesModels;

    public $campaign;
    public $activityType;
    public $activityDetails;

    /**
     * Create a new message instance.
     *
     * @param SharedCampaign $campaign
     * @param string $activityType 'rating' or 'comment'
     * @param array $activityDetails
     */
    public function __construct(SharedCampaign $campaign, $activityType, $activityDetails)
    {
        $this->campaign = $campaign;
        $this->activityType = $activityType;
        $this->activityDetails = $activityDetails;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $action = $this->activityType === 'rating' ? 'New Rating' : 'New Comment';
        return new Envelope(
            subject: "LoreForge: {$action} on your adventure!",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.campaign_activity',
        );
    }
}
