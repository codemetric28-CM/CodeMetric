# Code Metric — Marketing Site + Contact Backend

A one-page marketing site for a software engineering studio ("Code Metric"), with a Node.js/Express backend that handles the contact form via the Resend email API.

This README exists so you (or a fresh Claude chat) can get full context on the project fast.

---

## Tech Stack

- **Frontend:** plain HTML/CSS/JS (no framework, no build step). [AOS](https://michalsnik.github.io/aos/) is used for scroll animations.
- **Backend:** Node.js + Express
- **Email:** [Resend](https://resend.com) API (`resend` npm package) — sends a notification email to the company inbox and an auto-reply to the customer on every contact form submission.

## Folder Structure

```
.
├── server.js              # Express server, /api/contact endpoint
├── package.json
├── package-lock.json
├── .env                   # secrets — NOT committed
├── .env.example           # template, safe to commit
├── .gitignore
├── README.md
├── assets/                # raw design source files — NOT served by the site
│   ├── logo/
│   └── images/
└── public/
    ├── index.html         # the entire site (single page, anchor-linked sections)
    ├── styles.css
    └── scripts.js
```

`server.js` serves the `public/` folder as static files via `express.static('public')`, so `index.html`, `styles.css`, and `scripts.js` **must** live inside `public/`.

`assets/` is just a place to keep original logo/image source files for future edits — nothing in there is loaded by the live site, since all images are embedded directly into `index.html` as base64 data URIs.

## Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in real values:

```
RESEND_API_KEY=your_resend_api_key_here
COMPANY_EMAIL=your_inbox@example.com
PORT=3000
```

- `RESEND_API_KEY` — from the Resend dashboard (resend.com/api-keys).
- `COMPANY_EMAIL` — inbox that receives new contact-form submissions.
- The backend sends from `noreply@codemetric.in` — **that domain must be verified in Resend's dashboard** (DNS records) or sends will fail even with a valid API key.
- `.env` is gitignored. Never commit it.

## Running Locally

```bash
npm install
npm start          # runs `node server.js`
```

Then open `http://localhost:3000`.

## Page Sections (in order)

All are `<section>` elements inside `index.html`, anchor-linked from the nav:

| id | Section |
|---|---|
| `#top` | Hero |
| `#about` | About |
| `#services` | Services — 8 cards: Web Dev, Mobile App Dev, UI/UX, Cloud & DevOps, Cybersecurity, Data & Analytics, **AI & Machine Learning**, **IoT Solutions** (last two tagged "High Demand") |
| `#solutions` | Solutions |
| `#why` | Why Choose Us (animated stat counters) |
| `#insights` | Insights (blog-style cards) |
| `#projects` | Projects — currently one real entry, **FinPulse** ([live link](https://finpulse-api-lih8.onrender.com/)), in a single centered card |
| `#contact` | Contact — see below, this card now also doubles as Login/Register |

## ⭐ The Contact / Login / Register Flip Card

This is the most custom/unusual part of the project, worth understanding before touching it.

The **same physical card** in the `#contact` section has three faces and uses nested 3D CSS flips (no separate `#login` section exists anymore — it was merged in):

- **Front face** (`#contactFace`): the normal contact form (name, email, project type, details → `/api/contact`).
- **Back face** (`#authFace`): contains its *own* nested flip card with:
  - **Login** face (`#loginForm`)
  - **Register** face (`#registerForm`)

Behavior (in `scripts.js`, search `// Contact / Login / Register flip card`):

- Clicking **"Login"** (nav button, `id="loginNavBtn"`) → scrolls to `#contact`, then flips the outer card **right** (`rotateY`) to show the Login face (always resets to Login first, not Register).
- Clicking any other link pointing at `#contact` (nav "Contact", footer link, "Start a Project" buttons) → scrolls as normal and flips the card **back** to the Contact form if it wasn't already showing.
- Inside the Login form, **"Create an account"** → flips the *inner* card **up** (`rotateX`) to reveal Register.
- Inside the Register form, **"Log in"** → flips back down to Login.

**Important:** Login/Register forms are **UI only** — there is no auth backend yet. Submitting either form just shows a toast ("not connected to a backend yet"). If you want real authentication, you'll need to add user storage (e.g. a database), password hashing (bcrypt), and sessions/JWT to `server.js`.

Relevant CSS lives under the `/* CONTACT / LOGIN / REGISTER FLIP CARD */` comment in `styles.css` — classes: `.contact-flip`, `.contact-flip-inner`, `.flip-face`, `.auth-flip-inner`, `.auth-face`.

## Known Gaps / TODO

- [ ] No real authentication backend (Login/Register are placeholder UI).
- [ ] Resend sending domain (`codemetric.in`) needs to be verified in the Resend dashboard.
- [ ] `package.json` still lists `nodemailer` as a dependency though the code now only uses `resend` — safe to remove if you want to trim it.
- [ ] Only one real entry in the Projects section (FinPulse); the rest of that section's design assumes more cards could be added the same way (copy a `.project-card` block in `index.html`, reuse `.cards-grid`).
- [ ] Project cards / case study links in the Projects section just point to `#contact` for now — update if you add real case study pages.

## Deploying / Git

Standard flow:
```bash
git add .
git commit -m "your message"
git push
```
Double-check `.env` is not staged (`git status`) before pushing — it should already be excluded via `.gitignore`.
