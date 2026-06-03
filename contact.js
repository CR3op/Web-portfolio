// ============================================================
// Contact form handling + client-side anti-bot / anti-spam
// ------------------------------------------------------------
// NOTE: This is a static site, so the basic checks run in the
// browser. They stop the overwhelming majority of bots, spam,
// and link-droppers. For TRUE bot protection, add a Cloudflare
// Turnstile site key below AND a Web3Forms key — Web3Forms then
// verifies the Turnstile token server-side.
// ============================================================

const DELIVERY_CONFIG = {
    // Where messages go. By default the form opens the visitor's
    // email client (mailto) pre-filled with their message.
    email: '',

    // OPTIONAL: paste a Web3Forms access key (https://web3forms.com)
    // to receive messages directly in your inbox with no mailto step
    // and server-side spam filtering. Leave empty to use mailto.
    web3formsKey: ''
};

const TURNSTILE_CONFIG = {
    // OPTIONAL: paste your Cloudflare Turnstile SITE key
    // (https://dash.cloudflare.com/?to=/:account/turnstile).
    // When set, the privacy-friendly Turnstile widget replaces the
    // math captcha. Leave empty to keep the math captcha.
    siteKey: ''
};

// Minimum seconds a real human needs to fill the form.
const MIN_FILL_SECONDS = 4;
// Cooldown between submissions (anti-flood), in seconds.
const SUBMIT_COOLDOWN_SECONDS = 60;

// --- Turnstile state (shared across the async API callback) ---
let turnstileWidgetId = null;
const turnstileEnabled = !!TURNSTILE_CONFIG.siteKey;

// Called by the Cloudflare Turnstile API once it finishes loading.
// Must be on `window` so the async <script> onload can find it.
window.onTurnstileLoad = function () {
    if (!turnstileEnabled || typeof window.turnstile === 'undefined') return;

    const captchaField = document.getElementById('captcha-field');
    const turnstileField = document.getElementById('turnstile-field');
    const captchaInput = document.getElementById('captcha');
    if (captchaField) captchaField.style.display = 'none';
    if (captchaInput) captchaInput.removeAttribute('required');
    if (turnstileField) turnstileField.style.display = '';

    turnstileWidgetId = window.turnstile.render('#turnstile-widget', {
        sitekey: TURNSTILE_CONFIG.siteKey,
        theme: 'auto'
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const formLoadedAt = Date.now();

    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameInput = document.getElementById('name');
    const honeypot = document.getElementById('website');
    const captchaInput = document.getElementById('captcha');
    const captchaQuestion = document.getElementById('captcha-question');
    const charCount = document.getElementById('char-count');
    const messageBox = document.getElementById('form-message');

    // --- Work-in-progress popup (form isn't live yet) ---
    const wipOverlay = document.getElementById('wip-overlay');
    const wipClose = document.getElementById('wip-close');

    function openWipModal() {
        if (!wipOverlay) return;
        wipOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
        if (wipClose) wipClose.focus();
    }

    function closeWipModal() {
        if (!wipOverlay) return;
        wipOverlay.hidden = true;
        document.body.style.overflow = '';
    }

    if (wipClose) wipClose.addEventListener('click', closeWipModal);
    if (wipOverlay) {
        wipOverlay.addEventListener('click', (e) => {
            if (e.target === wipOverlay) closeWipModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wipOverlay && !wipOverlay.hidden) closeWipModal();
    });

    // --- Generate a random math captcha each load (fallback) ---
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    if (captchaQuestion) captchaQuestion.textContent = `What is ${a} + ${b}?`;
    const captchaAnswer = a + b;

    // --- Live character counter ---
    if (charCount && messageInput) {
        const updateCount = () => {
            charCount.textContent = `${messageInput.value.length} / 2000`;
        };
        messageInput.addEventListener('input', updateCount);
        updateCount();
    }

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.className = `form-message ${type}`;
    }

    // Returns the current Turnstile token, or '' if not solved.
    function getTurnstileToken() {
        if (!turnstileEnabled || typeof window.turnstile === 'undefined') return '';
        return window.turnstile.getResponse(turnstileWidgetId) || '';
    }

    function resetTurnstile() {
        if (turnstileEnabled && typeof window.turnstile !== 'undefined' && turnstileWidgetId !== null) {
            window.turnstile.reset(turnstileWidgetId);
        }
    }

    // Detects URLs / links in any form: http(s), www., bare domains,
    // markdown links, and obfuscated "dot" tricks (e.g. "site dot com").
    function containsLink(text) {
        const patterns = [
            /https?:\/\//i,
            /www\./i,
            /\[.*?\]\(.*?\)/,                         // markdown links
            /[a-z0-9-]+\.(com|net|org|io|co|ru|xyz|info|biz|link|click|shop|store|top|site|online|app|dev|me|tv|gg|ly|gl)\b/i,
            /\b[a-z0-9-]+\s+(dot|\.)\s+[a-z]{2,}\b/i, // "example dot com"
            /\b(?:t\.me|bit\.ly|tinyurl|discord\.gg|wa\.me|telegram)\b/i
        ];
        return patterns.some((re) => re.test(text));
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 120;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Delivery is still a work in progress, so the moment someone
        // tries to send we show a popup explaining the message won't go
        // through. The anti-spam checks below are kept for when the form
        // goes live — re-enable them by removing the early return.
        openWipModal();
        return;
    });

    // eslint-disable-next-line no-unused-vars
    function validateAndSend(e) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // 1) Honeypot — humans never see/fill this field.
        if (honeypot && honeypot.value.trim() !== '') {
            showMessage('Submission blocked.', 'error');
            return;
        }

        // 2) Time trap — bots submit near-instantly.
        const elapsed = (Date.now() - formLoadedAt) / 1000;
        if (elapsed < MIN_FILL_SECONDS) {
            showMessage('That was too fast — please take a moment and try again.', 'error');
            return;
        }

        // 3) Rate limit — block rapid repeat submissions.
        const lastSent = parseInt(localStorage.getItem('contactLastSent') || '0', 10);
        const sinceLast = (Date.now() - lastSent) / 1000;
        if (lastSent && sinceLast < SUBMIT_COOLDOWN_SECONDS) {
            const wait = Math.ceil(SUBMIT_COOLDOWN_SECONDS - sinceLast);
            showMessage(`Please wait ${wait}s before sending another message.`, 'error');
            return;
        }

        // 4) Human check — Turnstile if configured, else math captcha.
        let turnstileToken = '';
        if (turnstileEnabled) {
            turnstileToken = getTurnstileToken();
            if (!turnstileToken) {
                showMessage('Please complete the human verification check.', 'error');
                return;
            }
        } else if (parseInt(captchaInput.value.trim(), 10) !== captchaAnswer) {
            showMessage('Human check failed. Please solve the math question.', 'error');
            return;
        }

        // 5) Required fields + email validity.
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        if (message.length < 10) {
            showMessage('Please write a message of at least 10 characters.', 'error');
            return;
        }

        // 6) Block links / suspicious URLs in name or message.
        if (containsLink(message) || containsLink(name) || containsLink(email.split('@')[0])) {
            showMessage('Links and URLs are not allowed in messages. Please remove them and try again.', 'error');
            return;
        }

        // All checks passed — deliver the message.
        localStorage.setItem('contactLastSent', String(Date.now()));
        deliverMessage({ name, email, message, turnstileToken });
    }

    function deliverMessage({ name, email, message, turnstileToken }) {
        const submitBtn = form.querySelector('.submit-btn');

        if (DELIVERY_CONFIG.web3formsKey) {
            // Server-backed delivery. Web3Forms verifies the Turnstile
            // token server-side when 'cf-turnstile-response' is present.
            if (submitBtn) submitBtn.disabled = true;
            showMessage('Sending…', 'success');

            const payload = {
                access_key: DELIVERY_CONFIG.web3formsKey,
                subject: `Portfolio contact from ${name || email}`,
                from_name: name || 'Portfolio visitor',
                email,
                message
            };
            if (turnstileToken) payload['cf-turnstile-response'] = turnstileToken;

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload)
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        form.reset();
                        if (charCount) charCount.textContent = '0 / 2000';
                        showMessage('Thanks! Your message has been sent.', 'success');
                    } else {
                        showMessage('Something went wrong. Please try again later.', 'error');
                    }
                    resetTurnstile();
                })
                .catch(() => {
                    showMessage('Network error. Please try again later.', 'error');
                    resetTurnstile();
                })
                .finally(() => { if (submitBtn) submitBtn.disabled = false; });
            return;
        }

        // Default: open the visitor's email client, pre-filled.
        const subject = encodeURIComponent(`Portfolio contact from ${name || email}`);
        const body = encodeURIComponent(
            `Name: ${name || '(not provided)'}\nEmail: ${email}\n\n${message}`
        );
        window.location.href = `mailto:${DELIVERY_CONFIG.email}?subject=${subject}&body=${body}`;
        showMessage('Your email app should now open with the message ready to send.', 'success');
        form.reset();
        if (charCount) charCount.textContent = '0 / 2000';
        resetTurnstile();
    }
});
