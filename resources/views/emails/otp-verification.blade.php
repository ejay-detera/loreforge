<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', sans-serif; }
        .wrapper { max-width: 520px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 24px; letter-spacing: 2px; }
        .logo { max-width: 200px; height: auto; }
        .body { padding: 40px 32px; }
        .greeting { color: #94a3b8; font-size: 15px; margin-bottom: 24px; }
        .otp-box { background: #0f172a; border: 2px solid #10b981; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; letter-spacing: 16px; }
        .otp-code { font-size: 42px; font-weight: 700; color: #10b981; }
        .expiry { color: #64748b; font-size: 13px; text-align: center; margin-top: 8px; }
        .warning { background: #1e293b; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 4px; color: #94a3b8; font-size: 13px; margin-top: 24px; }
        .footer { border-top: 1px solid #334155; padding: 20px 32px; text-align: center; color: #475569; font-size: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>LOREFORGE</h1>
        </div>
        <div class="body">
            <p class="greeting">Hi {{ $userName }}, welcome to LoreForge!</p>
            <p style="color: #cbd5e1; font-size: 15px;">Use the code below to verify your email address:</p>

            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
            </div>
            <p class="expiry">⏱ Expires in 10 minutes</p>

            <div class="warning">
                ⚠️ Never share this code with anyone. LoreForge staff will never ask for your OTP.
            </div>
        </div>
        <div class="footer">
            © {{ date('Y') }} LoreForge. If you didn't request this, ignore this email.
        </div>
    </div>
</body>
</html>
