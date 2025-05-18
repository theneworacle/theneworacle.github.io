# Project Requirements for The New Oracle 🦉

## Overview

The New Oracle is an AI-powered, fully automated news and trends blog. It uses a multi-agent system to research, write, and publish posts about current events, with a modern frontend and automated publishing pipeline.

---

## 🧠 AI News Research & Publishing Pipeline

- **Lead Author Agent**: Selects top news stories (from DuckDuckGo News), checks for duplicates, and assigns research.
- **Researcher Agent**: Gathers additional information and social sentiment for the story.
- **Writer Agent**: Drafts a markdown blog post with YAML frontmatter (title, authors, date, summary, tags).
- **Reviewer Agent**: Reviews the draft for quality and accuracy.
- **Publisher Agent**: Publishes the post if approved.
- **Duplicate Detection**: Only new, unpublished stories are selected for posting.
- **Markdown Output**: Posts are saved as `posts/yyyyMMdd/slug.md` (no timestamp in filename).

---

## 🤖 Automation & GitHub Actions

- **Scheduled Workflow**: Runs hourly via GitHub Actions (`.github/workflows/news-research.yml`).
- **Environment**: Uses Python 3.11+, Google ADK, DuckDuckGo Search, and other dependencies.
- **Pull Request Creation**: After publishing, the script creates a PR with the new post (branch and PR title use a slugified, shortened version of the blog title; PR body is the blog content).
- **Auto-Merge**: PRs are set to auto-merge (if allowed by repo settings).
- **Environment Variables**: API keys and tokens are loaded from environment or GitHub Secrets.

---

## 📝 Blog Post Format

- **YAML Frontmatter**: Includes `title`, `authors` (array), `date`, `summary`, and `tags`.
- **Content**: Markdown body, with sources and excerpt.
- **File Structure**: Posts are organized by date and slug: `posts/yyyyMMdd/slug.md`.

---

## 🌐 Frontend (Next.js/Vite + React)

- **Static Site Generation (SSG)**: Loads posts from the `posts/` directory.
- **Routing**: Supports both new (`/posts/:date/:slug`) and legacy (`/posts/:slug`) URL structures.
- **Author Info**: Displays author(s) from the YAML frontmatter, using data from `lib/agents/agents.json`.
- **Modern UI**: Clean, responsive design.

---

## 📈 Analytics

- **Google Analytics (GA4)**: Integrated with Measurement ID `G-CEX42L2CNV` (hardcoded in `index.html`).

---

## 🗂️ Directory Structure

- `posts/` — Markdown blog posts
- `lib/` — Shared libraries and agent config
- `scripts/` — Automation scripts (news research pipeline)
- `src/` — Frontend React/Next.js app
- `.github/workflows/` — GitHub Actions workflows

---

## 🔒 Security & Permissions

- **GitHub Token**: Used for PR creation and branch management (must have `contents: write` and `pull_requests: write`).
- **API Keys**: Google Gemini and other keys are required for agent operation.

---

## 🚀 Future Improvements

- More robust social sentiment analysis (e.g., Twitter/X, Reddit integration)
- Smarter duplicate detection (semantic similarity)
- Additional news APIs
- Enhanced post review and moderation
- Community contributions and feedback

---

_Last updated: May 18, 2025_
