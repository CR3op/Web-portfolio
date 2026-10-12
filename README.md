# My Developer Portfolio

A single-page personal portfolio website with a **Mecha HUD** look — a tactical, sci-fi cockpit-style interface. It's my digital hub for my experience, projects, and technical skills.

Live at [www.carlos-roldan.com](https://www.carlos-roldan.com).

---

## 🎨 Design Philosophy

Version 2.0 replaces the original Persona 5–inspired design with a military-grade HUD aesthetic inspired by sci-fi anime engineering interfaces (*Knights of Sidonia*, Gundam cockpit telemetry). It features:

*   **Dark Cockpit Palette:** Graphite and void-black panels with hazard orange, laser cyan, and caution amber accents.
*   **Technical Typography:** Space Grotesk headlines, JetBrains Mono body text, and Space Mono micro-labels.
*   **Mechanical Shapes:** Chamfered (cut-corner) panels, 3D bevel buttons that press down, and a visible background grid.
*   **HUD Motion:** Flickering status lights, scrambling "decipher" headings, and a scanline sweep as each section scrolls into view. All animations turn off for visitors who prefer reduced motion.

---

## 🏗️ Website Structure

The whole site is now one page, with a sticky navigation bar that highlights the section you're viewing:

1. **About** — Introduction, degree, and engineering highlights.
2. **Experience** — Career timeline: VecSpace AI, SARE (NASA MINDS), electronics repair, and my UTRGV degree.
3. **Projects** — Six featured projects across robotics, edge AI, networking, and hardware.
4. **Skills** — Languages, robotics & edge AI, and hardware lab skills.
5. **Contact** — LinkedIn and GitHub links plus a contact form (message delivery isn't live yet).

The separate `projects.html` and `contact.html` pages from version 1 have been folded into the main page.

---

## 📱 Responsive Layout

The layout adapts to the screen size:

*   **Desktop:** 12-column layout with side-by-side panels.
*   **Tablet:** 2-column card grids.
*   **Mobile:** Single-column stack with a swipeable navigation row and tighter spacing.

---

## 📁 Files

| File | Purpose |
| --- | --- |
| `index.html` | The page markup |
| `tailwind-theme.js` | Design tokens: colors, fonts, spacing, and type sizes |
| `hud.css` | Custom styles: animations, chamfered shapes, bevel buttons |
| `hud.js` | Section reveals, heading scramble effect, nav highlighting, contact form |
| `CNAME` | Custom domain for GitHub Pages |

---

## 🛠️ Tech Stack

* **Frontend:** HTML5 (Semantic Structure)
* **Styling:** Tailwind CSS (via CDN) + custom CSS
* **Interactivity:** Vanilla JavaScript (Intersection Observer for scroll effects)
* **Hosting:** GitHub Pages

---

## 📄 License & Copyright

Copyright © 2026 Carlos Roldan. All rights reserved.

The source code in this repository is **not** open-source. I am sharing the code for transparency and as part of my professional portfolio to demonstrate my technical skills to recruiters and peers. 

**Unauthorized copying, distribution, or modification of any part of this repository is strictly prohibited.** You may view the code for educational purposes, but you may not use it to build your own website or redistribute it without my express written permission.
