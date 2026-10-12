const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   Header text scramble / decipher effect
   ========================================================================== */
const cipherChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@%&+-/<>=";

function scrambleText(element, targetText, duration = 900) {
    if (prefersReducedMotion) {
        element.textContent = targetText;
        return;
    }
    const startTime = performance.now();
    const len = targetText.length;

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const resolvedChars = Math.floor(progress * len);

        let output = "";
        for (let i = 0; i < len; i++) {
            const ch = targetText[i];
            if (ch === " " || ch === "&" || ch === "/" || ch === "," || i < resolvedChars) {
                output += ch;
            } else {
                output += cipherChars[Math.floor(Math.random() * cipherChars.length)];
            }
        }
        element.textContent = output;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = targetText;
        }
    }
    requestAnimationFrame(update);
}

/* ==========================================================================
   Section reveal + decipher headers on first view
   ========================================================================== */
function initSectionReveal() {
    const sections = document.querySelectorAll(".hud-reveal-section");

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const section = entry.target;
            section.classList.add("is-revealed");

            section.querySelectorAll(".decipher-header").forEach((h, idx) => {
                const target = h.getAttribute("data-text") || h.textContent.trim();
                setTimeout(() => scrambleText(h, target, 750 + idx * 150), idx * 100);
            });

            obs.unobserve(section);
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    sections.forEach(sec => revealObserver.observe(sec));
}

/* ==========================================================================
   Scrollspy: highlight the nav link for the section in view
   ========================================================================== */
function initScrollSpy() {
    const links = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section[id]");

    function setActive(id) {
        links.forEach(link => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(sec => spy.observe(sec));
}

/* ==========================================================================
   Contact form: delivery isn't wired up yet, so tell the visitor honestly
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("transmit-status");
    if (!form || !status) return;

    form.addEventListener("submit", e => {
        e.preventDefault();
        status.classList.remove("hidden");
        status.focus();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initSectionReveal();
    initScrollSpy();
    initContactForm();

    const year = document.getElementById("footer-year");
    if (year) year.textContent = new Date().getFullYear();
});
