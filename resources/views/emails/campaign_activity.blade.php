<!DOCTYPE html>
<html>
<head>
    <title>LoreForge Activity</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #080c18; color: #f0ead6; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #121628; border-radius: 8px; padding: 20px; border: 1px solid #a78bfa; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { color: #f5c842; font-size: 24px; font-weight: bold; }
        .content { font-size: 16px; line-height: 1.5; }
        .details { margin-top: 15px; padding: 15px; background-color: #0c101e; border-radius: 5px; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7a99; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">LoreForge</div>
        </div>
        <div class="content">
            <p>Hello {{ $campaign->sharedByUser->username }},</p>

            <p>Someone has interacted with your shared adventure, <strong>{{ $campaign->title ?? $campaign->gameSession->character_name . "'s Legend" }}</strong>!</p>

            <div class="details">
                @if($activityType === 'rating')
                    <p><strong>New Rating:</strong> {{ $activityDetails['rating'] }} Stars</p>
                @elseif($activityType === 'comment')
                    <p><strong>New Comment:</strong></p>
                    <p style="font-style: italic;">"{{ $activityDetails['body'] }}"</p>
                @endif
            </div>

            <p>Keep exploring the unknown!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} LoreForge. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
