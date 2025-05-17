# Tech Context: The Oracle

**Technologies Used:**
- **Frontend:** Next.js (React framework)
- **Content Formatting:** Markdown
- **Markdown Parsing:** `gray-matter` for frontmatter, `remark` and `remark-html` for converting Markdown to HTML.
- **Package Manager:** npm
- **Version Control:** Git
- **Hosting:** GitHub Pages
- **Automation/CI/CD:** GitHub Actions
- **AI Framework:** Google ADK (Multi-agent system)
- **LLM:** Gemini (initially, designed to be LLM-agnostic)

**Development Setup:**
- Node.js and npm installed.
- Git installed and configured.
- VS Code (recommended editor) with relevant extensions (e.g., for React, Markdown).

**Technical Constraints:**
- Static site limitations on dynamic features (handled by SSG where possible).
- GitHub Pages limitations (e.g., no server-side code execution).
- Reliance on GitHub Actions for all automation.

**Dependencies:**
- `next`
- `react`
- `react-dom`
- `gray-matter`
- `remark`
- `remark-html`

**Tool Usage Patterns:**
- `npm install`: To add or update project dependencies.
- `npm run dev`: To run the Next.js development server locally.
- `npm run build`: To build the static Next.js site.
- `git add`, `git commit`, `git push`: For version control and triggering GitHub Actions.
- GitHub Actions configuration (YAML files in `.github/workflows`) for defining automation pipelines.
