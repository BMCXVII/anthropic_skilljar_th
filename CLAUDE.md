# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, dependency-free Thai-language learning site that summarizes the courses of [Anthropic Academy](https://anthropic.skilljar.com/). Plain HTML + CSS + vanilla JS — **no build step, no package manager, no tests**.

## Running / previewing

- Quickest: open `index.html` in a browser (`file://` works).
- **For media to work, serve over HTTP instead of `file://`.** YouTube embeds are blocked on `file://` (Error 153) and the JS falls back to opening videos in a new tab; over HTTP they play inline. Image lightbox and Google-Fonts loading also behave best over HTTP.
  - `python -m http.server 8000` → open `http://localhost:8000`
- Deploy = copy the static files to any host (e.g. GitHub Pages, branch `main` / root).

Source data the site was built from (`01_*.json`, `02_*.json`, `03_*.json`, `PROMPT_for_claude_code.md`) is **gitignored** — it documents the real lesson content. Editorial rule carried over from that prompt: **do not invent features/commands/steps that aren't in the actual courses.**

## Architecture (the important part)

The site is **data-driven from one file**. `assets/js/courses-data.js` defines `window.CATEGORIES` and `window.COURSES` — the single source of truth. `assets/js/app.js` reads it to generate the hub catalog AND every course page's sidebar, so you rarely edit nav/markup by hand.

- **`app.js`** is one IIFE that branches on `document.body.dataset.page`:
  - `"hub"` (index.html) → builds the catalog, category filters, and search.
  - `"course"` (everything in `courses/`) → injects the navbar, builds the sidebar from `COURSES`, builds the on-page TOC from the article's `<h2>/<h3>`, adds prev/next + "mark complete", then runs `addCopyButtons`, `initVideos`, `initLightbox`, `initSidebarScroll`, `initReveal`.
- **Linking a page to its data:** the `<body data-course="<slug>">` value must equal a `COURSES[].slug`, and that slug must equal the HTML filename without `.html`. Order of the `COURSES` array = display order in sidebar/hub and prev/next; `num` is just a cosmetic label.
- **Progress** (which courses are "done") is stored in `localStorage`; **theme** in `localStorage` key `aa_theme`.

### Course page contract

Every page in `courses/` follows the same skeleton — copy an existing one when adding a page:

1. `<head>` contains, in order: meta, an **inline theme-boot `<script>`** (reads `aa_theme` and sets `data-theme` before paint), then `<link rel="stylesheet">`. Keep this order — it prevents a light→dark flash.
2. `<body data-course="..." data-page="course">` → a single `<article class="prose" id="article">` holding the content.
3. Scripts at the end: `courses-data.js`, an optional inline `window.QUIZ = [...]`, `app.js`, and `quiz.js` if there's a quiz.
4. The whole body is hidden via CSS (`body { visibility:hidden }`) until `app.js` adds `body.cc-ready` after assembling the layout — this is the anti-flicker mechanism. Don't remove it.

### Media conventions (used across many pages)

- **YouTube** → `<div class="video-embed yt-facade" data-yt="VIDEO_ID" data-title="..."></div>` (a click-to-play facade built by `initVideos`). **Never hardcode a raw `<iframe>`** — it 153-errors on `file://`.
- **Slide images** → local files in `assets/img/`, as `<figure class="fig"><img src="../assets/img/..." loading="lazy"><figcaption>…</figcaption></figure>`; group multiples in `<div class="media-grid">` (renders one per row). Clicking opens a lightbox.
- **Platform-player lessons** (API / MCP / Bedrock / Vertex / Code-in-Action videos that have no public YouTube link) → a `.platform-video` card that links to the real `lesson_url`, not an embed.

### Quiz

Define `window.QUIZ = [{ q, opts: [...], answer: <index>, explain }]` before `app.js`; `quiz.js` renders it into `<div id="quiz-mount"></div>`.

### Case studies (two distinct kinds)

- `courses/case-<topic>.html` — step-by-step tutorials using `.step` / `.prompt-box` components; no quiz, no `case-study.js`.
- `courses/case-study-*.html` — interactive team simulations: a `<div id="cs-mount">`, `window.CS_*` data, and `case-study.js`.

## Styling

`assets/css/styles.css` is the whole design system: CSS variables in `:root`, dark theme via `[data-theme="dark"]` on `<html>`, and reusable component classes (`.callout[.tip/.warn/.info/.key/.danger/.result]`, `.tile`, `.takeaways`, `.step`, `.fig`, `.media-grid`, `.video-embed`/`.yt-facade`, `.platform-video`, `.prompt-box`, `.lightbox`, `.topic-tile`). Prefer these classes over new CSS so pages stay consistent.

## Gotchas

- `assets/js/lessons-data.js` (`window.LESSONS`) is **orphaned/unreferenced** — don't rely on it; the live data is `courses-data.js`.
- Adding a course/case = create the HTML in `courses/` **and** add a matching entry to `courses-data.js` (slug = filename). Missing either breaks the sidebar/links.
