// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navigation highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`.nav-links a[href*="${sectionId}"]`)?.classList.add('active');
        } else {
            document.querySelector(`.nav-links a[href*="${sectionId}"]`)?.classList.remove('active');
        }
    });
}

// Scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
});

// Add scroll event listener
window.addEventListener('scroll', highlightNavigation);

// Mobile menu toggle
const menuButton = document.querySelector('[aria-label="Toggle menu"]');
const mobileMenu = document.querySelector('#mobile-menu');

if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');
    });
}

// Theme switching functionality (shared across all pages)
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    updateThemeIcons(savedTheme === 'light', sunIcon, moonIcon);

    themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const newTheme = isLight ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(!isLight, sunIcon, moonIcon);
    });
}

function updateThemeIcons(isLight, sunIcon, moonIcon) {
    if (!sunIcon || !moonIcon) return;
    if (isLight) {
        sunIcon.style.opacity = '0';
        moonIcon.style.opacity = '1';
    } else {
        sunIcon.style.opacity = '1';
        moonIcon.style.opacity = '0';
    }
}

// Collapsible skills list — show the first few, reveal the rest on demand
function initializeSkillsToggle() {
    const toggle = document.getElementById('skills-toggle');
    const list = document.getElementById('skills-list');
    if (!toggle || !list) return;

    const label = toggle.querySelector('.skills-toggle-text');

    toggle.addEventListener('click', () => {
        const expanded = list.classList.toggle('expanded');
        toggle.setAttribute('aria-expanded', String(expanded));
        if (label) label.textContent = expanded ? 'Show less' : 'Show more';
    });
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeSkillsToggle();
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-on-scroll');
    });
    highlightNavigation();
}); 